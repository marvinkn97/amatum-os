package dev.marvin.courseservice.course;

import dev.marvin.courseservice.category.CategoryEntity;
import dev.marvin.courseservice.category.CategoryRepository;
import dev.marvin.courseservice.exception.BadRequestException;
import dev.marvin.courseservice.exception.ResourceNotFoundException;
import dev.marvin.courseservice.learningstep.LearningStepMapper;
import dev.marvin.courseservice.learningstep.LearningStepRepository;
import dev.marvin.courseservice.learningstep.LearningStepResponse;
import dev.marvin.courseservice.module.ModuleEntity;
import dev.marvin.courseservice.module.ModuleRepository;
import dev.marvin.courseservice.module.ModuleResponse;
import dev.marvin.courseservice.security.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseService {
    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;
    private final ModuleRepository moduleRepository;
    private final LearningStepRepository learningStepRepository;

    @Transactional
    public CourseResponse create(CourseRequest request) {
        log.info("Creating course with title: {}", request.title());
        if (!TenantContext.TENANT_ID.isBound()) {
            throw new BadRequestException("No active organization context found in request");
        }

        String activeTenantId = TenantContext.TENANT_ID.get();
        CategoryEntity category = categoryRepository.findById(request.categoryId())
                .orElseThrow(()-> new BadRequestException("Category with id [%s] is invalid".formatted(request.categoryId())));

        Set<String> cleanTags = request.tags().stream()
                .map(String::trim)
                .map(String::toUpperCase)
                .collect(Collectors.toSet());

        CourseEntity course = CourseEntity.builder()
                .title(request.title())
                .slug(request.slug())
                .category(category)
                .description(request.description())
                .accessTier(request.accessTier())
                .price(request.accessTier() == CourseAccessTier.FREE ? BigDecimal.ZERO : request.price())
                .isFeatured(request.isFeatured())
                .tags(cleanTags) // Set the processed list
                .tenantId(activeTenantId)
                .build();

       course =  courseRepository.save(course);
       return CourseMapper.mapToResponse(course);
    }

    @Transactional
    public void update(UUID id, CourseRequest update) {
        log.info("Updating course with id: {}", id);
        CourseEntity course = courseRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Course with id [%s] is invalid".formatted(id)));

        boolean changes = false;

        if(!course.getTitle().equals(update.title())){
            course.setTitle(update.title());
            course.setSlug(update.slug());
            changes = true;
        }


        if(!course.getCategory().getId().equals(update.categoryId())){
            CategoryEntity category = categoryRepository.findById(update.categoryId()).
                    orElseThrow(()-> new BadRequestException("Category with id [%s] is invalid".formatted(update.categoryId())));
            course.setCategory(category);
            changes = true;
        }

        if(!course.getDescription().equals(update.description())){
            course.setDescription(update.description());
            changes = true;
        }

        if (!course.getAccessTier().equals(update.accessTier())) {
            course.setAccessTier(update.accessTier());
            changes = true;
        }

        if (update.accessTier() == CourseAccessTier.FREE) {
                course.setPrice(BigDecimal.ZERO);
                changes = true;
            }


        if (update.accessTier() == CourseAccessTier.PREMIUM) {

            if (update.price() == null || update.price().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Premium course must have price greater than zero");
            }

            if (course.getPrice().compareTo(update.price()) != 0) {
                course.setPrice(update.price());
                changes = true;
            }
        }


        if(course.isFeatured() != update.isFeatured()){
            course.setFeatured(update.isFeatured());
            changes = true;
        }


        Set<String> incomingTags = update.tags().stream()
                .map(t -> t.trim().toUpperCase())
                .filter(t -> !t.isEmpty())
                .collect(Collectors.toSet());

        if (!new HashSet<>(course.getTags()).equals(incomingTags)) {
            course.getTags().clear();
            course.getTags().addAll(incomingTags);
            changes = true;
        }

        if (!changes) {
            log.info("No changes detected for course {}", id);
            return;
        }

        courseRepository.save(course);
    }

    @Transactional(readOnly = true)
    public CourseResponse getCourseById(UUID id) {
        log.info("Getting course with id: {}", id);

        // 1. Fetch the main course
        CourseEntity course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course with id [%s] not found".formatted(id)));

        // 2. Fetch all modules for this course in one go
        List<ModuleEntity> moduleEntities = moduleRepository.findByCourse_IdOrderBySequenceAsc(course.getId());
        List<UUID> moduleIds = moduleEntities.stream().map(ModuleEntity::getId).toList();

        // 3. Fetch ALL steps for ALL modules in one single query (Solves N+1)
        // We group them by Module ID using a Map for efficient distribution
        Map<UUID, List<LearningStepResponse>> stepsByModuleId = learningStepRepository.findByModule_IdIn(moduleIds)
                .stream()
                .map(LearningStepMapper::mapToResponse)
                .collect(Collectors.groupingBy(LearningStepResponse::moduleId));

        // 4. Build the ModuleResponses and attach their specific steps from the Map
        List<ModuleResponse> moduleResponses = moduleEntities.stream()
                .map(m -> new ModuleResponse(
                        m.getId(),
                        m.getTitle(),
                        m.getSequence(),
                        // Lookup the list of steps for this specific module ID, default to empty list
                        stepsByModuleId.getOrDefault(m.getId(), List.of())
                ))
                .toList();

        return CourseMapper.mapToResponseWithModulesAndLessons(course, moduleResponses);
    }

    @Transactional(readOnly = true)
    public Page<CourseResponse> getAllActiveCourses(Pageable pageable){
        log.info("Getting all active courses");

        if (!TenantContext.TENANT_ID.isBound()) {
            throw new BadRequestException("No active organization context found in request");
        }

        log.info("isBound: {}", TenantContext.TENANT_ID.isBound());
        log.info("ScopedValue.get() safe? {}", TenantContext.TENANT_ID.isBound() ? TenantContext.TENANT_ID.get() : "not bound");

        String activeTenantId = TenantContext.TENANT_ID.get();

        log.info("Active tenant id: {}", activeTenantId);


        return courseRepository.findByTenantIdAndIsDeleted(activeTenantId, false, pageable)
                .map(CourseMapper::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<CourseResponse> getAllArchivedCourses(Pageable pageable){
        log.info("Getting all archived courses");
        if (!TenantContext.TENANT_ID.isBound()) {
            throw new BadRequestException("No active organization context found in request");
        }

        String activeTenantId = TenantContext.TENANT_ID.get();

        return courseRepository.findByTenantIdAndIsDeleted(activeTenantId, true, pageable)
                .map(CourseMapper::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<CourseResponse> searchActiveCourses(String name, UUID categoryId, Pageable pageable) {
        log.info("Searching active courses with name: {}, categoryId: {}", name, categoryId);

        if (!TenantContext.TENANT_ID.isBound()) {
            throw new BadRequestException("No active organization context found in request");
        }

        String activeTenantId = TenantContext.TENANT_ID.get();

        return courseRepository.findActiveByNameCategoryAndTenant(name, categoryId, activeTenantId, pageable)
                .map(CourseMapper::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<CourseResponse> searchArchivedCourses(String name, UUID categoryId, Pageable pageable) {
        log.info("Searching archived courses with name: {}, categoryId: {}", name, categoryId);

        if (!TenantContext.TENANT_ID.isBound()) {
            throw new BadRequestException("No active organization context found in request");
        }

        String activeTenantId = TenantContext.TENANT_ID.get();


        return courseRepository.findArchivedByNameCategoryAndTenant(name, categoryId, activeTenantId,  pageable)
                .map(CourseMapper::mapToResponse);
    }

    @Transactional
    public void delete(UUID id){
        log.info("Deleting course with id: {}", id);
        CourseEntity course = courseRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Course with id [%s] not found".formatted(id)));
        course.setIsDeleted(true);
        courseRepository.save(course);
    }

    @Transactional
    public void restore(UUID id){
        log.info("Restoring course with id: {}", id);
        CourseEntity course = courseRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Course with id [%s] not found".formatted(id)));
        course.setIsDeleted(false);
        courseRepository.save(course);
    }

}

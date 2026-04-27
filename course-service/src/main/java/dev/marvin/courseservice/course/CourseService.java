package dev.marvin.courseservice.course;

import dev.marvin.courseservice.category.CategoryEntity;
import dev.marvin.courseservice.category.CategoryRepository;
import dev.marvin.courseservice.common.Status;
import dev.marvin.courseservice.exception.BadRequestException;
import dev.marvin.courseservice.exception.ResourceNotFoundException;
import dev.marvin.courseservice.learningstep.*;
import dev.marvin.courseservice.lesson.LessonEntity;
import dev.marvin.courseservice.lesson.LessonRepository;
import dev.marvin.courseservice.module.ModuleEntity;
import dev.marvin.courseservice.module.ModuleReOrderRequest;
import dev.marvin.courseservice.module.ModuleRepository;
import dev.marvin.courseservice.module.ModuleResponse;
import dev.marvin.courseservice.quiz.answer.QuizAnswerOption;
import dev.marvin.courseservice.quiz.answer.QuizAnswerOptionRepository;
import dev.marvin.courseservice.quiz.answer.QuizAnswerOptionResponse;
import dev.marvin.courseservice.quiz.question.QuizQuestion;
import dev.marvin.courseservice.quiz.question.QuizQuestionRepository;
import dev.marvin.courseservice.quiz.question.QuizQuestionResponse;
import dev.marvin.courseservice.quiz.quiz.QuizEntity;
import dev.marvin.courseservice.quiz.quiz.QuizRepository;
import dev.marvin.courseservice.quiz.quiz.QuizResponse;
import dev.marvin.courseservice.security.TenantContext;
import dev.marvin.courseservice.storage.rustfs.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseService {
    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;
    private final ModuleRepository moduleRepository;
    private final LearningStepRepository learningStepRepository;
    private final LessonRepository lessonRepository;
    private final LearningStepResourceRepository learningStepResourceRepository;
    private final S3Service s3Service;
    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final QuizAnswerOptionRepository quizAnswerOptionRepository;

    @Transactional
    public CourseResponse create(CourseRequest request) {
        log.info("Creating course with title: {}", request.title());
        if (!TenantContext.TENANT_ID.isBound()) {
            throw new BadRequestException("No active organization context found in request");
        }

        String activeTenantId = TenantContext.TENANT_ID.get();
        CategoryEntity category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new BadRequestException("Category with id [%s] is invalid".formatted(request.categoryId())));

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
                .isPublic(request.isPublic())
                .tags(cleanTags) // Set the processed list
                .tenantId(activeTenantId)
                .build();

        course = courseRepository.save(course);
        return CourseMapper.mapToResponse(course);
    }

    @Transactional
    public void update(UUID id, CourseRequest update) {
        log.info("Updating course with id: {}", id);
        CourseEntity course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course with id [%s] is invalid".formatted(id)));

        boolean changes = false;

        if (!course.getTitle().equals(update.title())) {
            course.setTitle(update.title());
            course.setSlug(update.slug());
            changes = true;
        }


        if (!course.getCategory().getId().equals(update.categoryId())) {
            CategoryEntity category = categoryRepository.findById(update.categoryId()).
                    orElseThrow(() -> new BadRequestException("Category with id [%s] is invalid".formatted(update.categoryId())));
            course.setCategory(category);
            changes = true;
        }

        if (!course.getDescription().equals(update.description())) {
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


        if (course.isPublic() != update.isPublic()) {
            course.setPublic(update.isPublic());
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
        return getHydratedCourseResponse(id);
    }

    @Transactional(readOnly = true)
    public Page<CourseResponse> getAllActiveCourses(Pageable pageable) {
        log.info("Getting all active courses");

        if (!TenantContext.TENANT_ID.isBound()) {
            throw new BadRequestException("No active organization context found in request");
        }

        log.info("isBound: {}", TenantContext.TENANT_ID.isBound());
        log.info("ScopedValue.get() safe? {}", TenantContext.TENANT_ID.isBound() ? TenantContext.TENANT_ID.get() : "not bound");

        String activeTenantId = TenantContext.TENANT_ID.get();

        log.info("Active tenant id: {}", activeTenantId);

        Page<CourseEntity> coursePage = courseRepository.findByTenantIdAndIsDeleted(activeTenantId, false, pageable);

        return mapCoursePageToResponseWithCounts(coursePage);
    }

    @Transactional(readOnly = true)
    public Page<CourseResponse> getAllArchivedCourses(Pageable pageable) {
        log.info("Getting all archived courses");
        if (!TenantContext.TENANT_ID.isBound()) {
            throw new BadRequestException("No active organization context found in request");
        }

        String activeTenantId = TenantContext.TENANT_ID.get();

        Page<CourseEntity> coursePage = courseRepository.findByTenantIdAndIsDeleted(activeTenantId, true, pageable);

        return mapCoursePageToResponseWithCounts(coursePage);
    }

    @Transactional(readOnly = true)
    public Page<CourseResponse> searchActiveCourses(String name, UUID categoryId, Pageable pageable) {
        log.info("Searching active courses with name: {}, categoryId: {}", name, categoryId);

        if (!TenantContext.TENANT_ID.isBound()) {
            throw new BadRequestException("No active organization context found in request");
        }

        String activeTenantId = TenantContext.TENANT_ID.get();

        Page<CourseEntity> coursePage = courseRepository.findActiveByNameCategoryAndTenant(name, categoryId, activeTenantId, pageable);

        return mapCoursePageToResponseWithCounts(coursePage);
    }

    @Transactional(readOnly = true)
    public Page<CourseResponse> searchArchivedCourses(String name, UUID categoryId, Pageable pageable) {
        log.info("Searching archived courses with name: {}, categoryId: {}", name, categoryId);

        if (!TenantContext.TENANT_ID.isBound()) {
            throw new BadRequestException("No active organization context found in request");
        }

        String activeTenantId = TenantContext.TENANT_ID.get();

        Page<CourseEntity> coursePage = courseRepository.findArchivedByNameCategoryAndTenant(name, categoryId, activeTenantId, pageable);

        return mapCoursePageToResponseWithCounts(coursePage);
    }

    @Transactional
    public void delete(UUID id) {
        log.info("Deleting course with id: {}", id);
        CourseEntity course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course with id [%s] not found".formatted(id)));
        course.setIsDeleted(true);
        courseRepository.save(course);
    }

    @Transactional
    public void restore(UUID id) {
        log.info("Restoring course with id: {}", id);
        CourseEntity course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course with id [%s] not found".formatted(id)));
        course.setIsDeleted(false);
        courseRepository.save(course);
    }

    @Transactional
    public void reOrderModuleSequence(UUID courseId, List<ModuleReOrderRequest> moduleReOrderRequestList) {
        log.info("Re-ordering modules for course with id: {}", courseId);

        // 1. Fetch the course to ensure it exists
        CourseEntity course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course with id [%s] not found".formatted(courseId)));

        // 2. Get the current modules from the course
        List<ModuleEntity> moduleEntities = moduleRepository.findByCourse_Id(course.getId());

        // 3. Map the new sequences from the request
        // We turn the request list into a Map for O(1) lookup speed
        Map<UUID, Integer> sequenceMap = moduleReOrderRequestList.stream()
                .collect(Collectors.toMap(ModuleReOrderRequest::moduleId, ModuleReOrderRequest::sequence));

        // 4. Update the entities in memory
        moduleEntities.forEach(module -> {
            Integer newSequence = sequenceMap.get(module.getId());
            if (newSequence != null) {
                module.setSequence(newSequence);
            }
        });

        // 5. Batch Save
        // JPA is smart enough to update only the changed 'sequence' columns
        moduleRepository.saveAll(moduleEntities);

        log.info("Successfully re-ordered {} modules for course {}", moduleEntities.size(), courseId);

    }

    @Transactional
    public CourseResponse publishCourse(UUID courseId) {
        log.info("Publishing course with id: {}", courseId);
        CourseEntity course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course with id [%s] not found".formatted(courseId)));

        if (course.getStatus().equals(Status.PUBLISHED)) {
            log.info("Course {} is already published", courseId);
            return getHydratedCourseResponse(courseId); // Return full hydrated response
        }

        List<ModuleEntity> modules = moduleRepository.findByCourse_Id(courseId);
        if (modules.isEmpty()) {
            throw new BadRequestException("Cannot publish a course with no modules");
        }

        boolean allModulesPublished = modules.stream()
                .allMatch(m -> m.getStatus().equals(Status.PUBLISHED));

        if (!allModulesPublished) {
            throw new BadRequestException("All modules must be published before publishing the course");
        }

        course.setStatus(Status.PUBLISHED);
        courseRepository.save(course);

        return getHydratedCourseResponse(courseId);   // Return full hydrated response

    }

    private CourseResponse getHydratedCourseResponse(UUID id) {
        log.info("Getting course with id: {}", id);

        // Fetch Course
        CourseEntity course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course with id [%s] not found".formatted(id)));

        // Fetch Modules
        List<ModuleEntity> moduleEntities = moduleRepository.findByCourse_IdOrderBySequenceAsc(course.getId());
        List<UUID> moduleIds = moduleEntities.stream().map(ModuleEntity::getId).toList();

        // Fetch All Steps
        List<LearningStepEntity> stepEntities = learningStepRepository.findByModule_IdIn(moduleIds);
        List<UUID> stepIds = stepEntities.stream().map(LearningStepEntity::getId).toList();

        // Bulk fetch resources
        List<LearningStepResourceEntity> resourceEntities =
                learningStepResourceRepository.findByLearningStepEntity_IdIn(stepIds);

        // Group resources by step ID for easy lookup
        Map<UUID, List<LearningStepResourceResponse>> resourcesByStepId =
                resourceEntities.stream()
                        .collect(Collectors.groupingBy(
                                r -> r.getLearningStepEntity().getId(),
                                Collectors.mapping(r ->
                                                new LearningStepResourceResponse(
                                                        r.getId(),
                                                        r.getName(),
                                                        r.getObjectKey(),
                                                        s3Service.generatePresignedUrl(r.getObjectKey()),
                                                        r.getContentType(),
                                                        r.getSize()
                                                ),
                                        Collectors.toList()
                                )
                        ));

        // --- NEW: FETCH LESSONS IN BULK (Using Entities) ---
        Map<UUID, LessonEntity> lessonsByStepId = lessonRepository.findByLearningStepEntity_IdIn(stepIds)
                .stream()
                .collect(Collectors.toMap(
                        lesson -> lesson.getLearningStepEntity().getId(), // Key: The UUID of the Step
                        Function.identity(),                        // Value: The LessonEntity itself
                        (existing, _) -> existing         // Merge function to prevent duplicates
                ));

        // Fetch the Quiz headers
        List<QuizEntity> quizEntities = quizRepository.findByLearningStepEntity_IdIn(stepIds);
        List<UUID> quizIds = quizEntities.stream().map(QuizEntity::getId).toList();

        // Fetch all Questions for these Quizzes
        //  (Assuming you have a QuizQuestionRepository)
        Map<UUID, List<QuizQuestion>> questionsByQuizId =
                quizQuestionRepository.findByQuizEntity_IdIn(quizIds).stream()
                        .collect(Collectors.groupingBy(q -> q.getQuizEntity().getId()));

        // Fetch all Answer Options for these Questions
        List<UUID> questionIds = questionsByQuizId.values().stream()
                .flatMap(List::stream)
                .map(QuizQuestion::getId)
                .toList();

        Map<UUID, List<QuizAnswerOption>> optionsByQuestionId =
                quizAnswerOptionRepository.findByQuizQuestion_IdIn(questionIds).stream()
                        .collect(Collectors.groupingBy(opt -> opt.getQuizQuestion().getId()));

        //  Assemble the QuizResponse Map
        Map<UUID, QuizResponse> quizzesByStepId = quizEntities.stream()
                .collect(Collectors.toMap(
                        quiz -> quiz.getLearningStepEntity().getId(),
                        quiz -> {
                            List<QuizQuestion> questions = questionsByQuizId.getOrDefault(quiz.getId(), List.of());

                            List<QuizQuestionResponse> questionResponses = questions.stream()
                                    .map(q -> {
                                        List<QuizAnswerOptionResponse> optionResponses = optionsByQuestionId.getOrDefault(q.getId(), List.of())
                                                .stream()
                                                .map(opt -> new QuizAnswerOptionResponse(opt.getId(), opt.getAnswerText(), opt.isCorrect()))
                                                .toList();

                                        return new QuizQuestionResponse(q.getId(), q.getQuestionText(), q.isHasMultipleAnswers(), optionResponses);
                                    }).toList();

                            return new QuizResponse(quiz.getId(), questionResponses);
                        }
                ));

        //  Group Steps by Module ID and Flatten Lesson Data
        Map<UUID, List<LearningStepResponse>> stepsByModuleId = stepEntities.stream()
                .map(entity -> {
                    if (entity.getType().equals(LearningStepType.LESSON)) {
                        // Get the lesson entity from the map
                        LessonEntity lesson = lessonsByStepId.get(entity.getId());
                        // Use the two-argument mapper to flatten lesson fields

                        List<LearningStepResourceResponse> resources =
                                resourcesByStepId.getOrDefault(entity.getId(), List.of());

                        return LearningStepMapper.mapToResponse(entity, lesson, resources, null);
                    }

                    if (entity.getType().equals(LearningStepType.QUIZ)) {
                        QuizResponse quizResponse = quizzesByStepId.get(entity.getId());
                        return LearningStepMapper.mapToResponse(entity, null, null, quizResponse);
                    }

                    // Fallback for QUIZ or other types: use the standard one-argument mapper
                    return LearningStepMapper.mapToResponse(entity);
                })
                .collect(Collectors.groupingBy(LearningStepResponse::getModuleId));

        // Group the RAW entities by Module ID first
        Map<UUID, List<LearningStepEntity>> rawStepsByModuleId = stepEntities.stream()
                .collect(Collectors.groupingBy(s -> s.getModule().getId()));

        // Build ModuleResponses
        List<ModuleResponse> moduleResponses = moduleEntities.stream()
                .map(m -> {

                    List<LearningStepEntity> rawSteps = rawStepsByModuleId.getOrDefault(m.getId(), List.of());

                    // Check entities directly
                    boolean isReady = !rawSteps.isEmpty() && rawSteps.stream()
                            .allMatch(learningStepEntity -> learningStepEntity.getStatus().equals(Status.PUBLISHED));

                    return new ModuleResponse(
                            m.getId(),
                            m.getTitle(),
                            m.getSequence(),
                            m.getStatus(),
                            isReady,
                            stepsByModuleId.getOrDefault(m.getId(), List.of())
                    );
                })
                .toList();

        List<ModuleEntity> modules = moduleRepository.findByCourse_Id(course.getId());

        boolean allModulesPublished = modules.stream()
                .allMatch(m -> m.getStatus().equals(Status.PUBLISHED));


        boolean allStepsPublished = modules.stream()
                .allMatch(m -> {
                    List<LearningStepEntity> steps = rawStepsByModuleId.getOrDefault(m.getId(), List.of());
                    return !steps.isEmpty() && steps.stream().allMatch(s -> s.getStatus().equals(Status.PUBLISHED));
                });

        boolean isReadyToPublish = !modules.isEmpty() && allModulesPublished && allStepsPublished;

        return CourseMapper.mapToResponseWithModulesAndLessons(course, isReadyToPublish, moduleResponses, moduleEntities.size(), stepEntities.size());
    }

    private Page<CourseResponse> mapCoursePageToResponseWithCounts(Page<CourseEntity> coursePage) {
        List<UUID> courseIds = coursePage.getContent().stream()
                .map(CourseEntity::getId)
                .toList();

        if (courseIds.isEmpty()) {
            log.info("No courses found in the page");
            return Page.empty();
        }

        // Bulk fetch counts in two efficient queries
        Map<UUID, Long> moduleCounts = moduleRepository.countModulesByCourseIds(courseIds)
                .stream()
                .collect(Collectors.toMap(row -> (UUID) row[0], row -> (Long) row[1]));

        Map<UUID, Long> stepCounts = learningStepRepository.countStepsByCourseIds(courseIds)
                .stream()
                .collect(Collectors.toMap(row -> (UUID) row[0], row -> (Long) row[1]));

        // Map using your updated CourseMapper
        return coursePage.map(courseEntity -> {
            int moduleCount = moduleCounts.getOrDefault(courseEntity.getId(), 0L).intValue();
            int stepCount = stepCounts.getOrDefault(courseEntity.getId(), 0L).intValue();
            return CourseMapper.mapToResponse(courseEntity, moduleCount, stepCount);
        });
    }


    @Transactional(readOnly = true)
    public Page<CourseResponse> getLearnerCatalog(String name, UUID categoryId, Pageable pageable) {
        log.info("Fetching learner catalog. Search: {}, Category: {}", name, categoryId);

        // 1. Get tenantId from context if it exists (for corporate learners),
        //    otherwise null (for independent marketplace learners).
        String activeTenantId = TenantContext.TENANT_ID.isBound() ? TenantContext.TENANT_ID.get() : null;

        // 2. Execute the refined query that handles Public + Specific Tenant logic
        Page<CourseEntity> coursePage = courseRepository.findMarketplaceAndTenantCourses(
                name,
                categoryId,
                activeTenantId,
                pageable
        );

        // 3. Use your private reusable method to bulk-fetch counts and map to Response
        return mapCoursePageToResponseWithCounts(coursePage);
    }


    @Transactional(readOnly = true)
    public CourseResponse getLearnerCourseView(UUID id) {
        log.info("Fetching learner course with id: {}", id);

        // Fetch Course
        CourseEntity course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course with id [%s] not found".formatted(id)));

        // Fetch Modules
        List<ModuleEntity> moduleEntities = moduleRepository.findByCourse_IdOrderBySequenceAsc(course.getId());
        List<UUID> moduleIds = moduleEntities.stream().map(ModuleEntity::getId).toList();

        // Fetch All Steps
        List<LearningStepEntity> stepEntities = learningStepRepository.findByModule_IdIn(moduleIds);
        List<UUID> stepIds = stepEntities.stream().map(LearningStepEntity::getId).toList();

        // Bulk fetch resources
        List<LearningStepResourceEntity> resourceEntities =
                learningStepResourceRepository.findByLearningStepEntity_IdIn(stepIds);

        // Group resources by step ID for easy lookup
        Map<UUID, List<LearningStepResourceResponse>> resourcesByStepId =
                resourceEntities.stream()
                        .collect(Collectors.groupingBy(
                                r -> r.getLearningStepEntity().getId(),
                                Collectors.mapping(r ->
                                                new LearningStepResourceResponse(
                                                        r.getId(),
                                                        r.getName(),
                                                        s3Service.generatePresignedUrl(r.getObjectKey()),
                                                        r.getContentType(),
                                                        r.getSize()
                                                ),
                                        Collectors.toList()
                                )
                        ));

        // --- NEW: FETCH LESSONS IN BULK (Using Entities) ---
        Map<UUID, LessonEntity> lessonsByStepId = lessonRepository.findByLearningStepEntity_IdIn(stepIds)
                .stream()
                .collect(Collectors.toMap(
                        lesson -> lesson.getLearningStepEntity().getId(), // Key: The UUID of the Step
                        Function.identity(),                        // Value: The LessonEntity itself
                        (existing, _) -> existing         // Merge function to prevent duplicates
                ));

        // Fetch the Quiz headers
        List<QuizEntity> quizEntities = quizRepository.findByLearningStepEntity_IdIn(stepIds);
        List<UUID> quizIds = quizEntities.stream().map(QuizEntity::getId).toList();

        // Fetch all Questions for these Quizzes
        //  (Assuming you have a QuizQuestionRepository)
        Map<UUID, List<QuizQuestion>> questionsByQuizId =
                quizQuestionRepository.findByQuizEntity_IdIn(quizIds).stream()
                        .collect(Collectors.groupingBy(q -> q.getQuizEntity().getId()));

        // Fetch all Answer Options for these Questions
        List<UUID> questionIds = questionsByQuizId.values().stream()
                .flatMap(List::stream)
                .map(QuizQuestion::getId)
                .toList();

        Map<UUID, List<QuizAnswerOption>> optionsByQuestionId =
                quizAnswerOptionRepository.findByQuizQuestion_IdIn(questionIds).stream()
                        .collect(Collectors.groupingBy(opt -> opt.getQuizQuestion().getId()));

        //  Assemble the QuizResponse Map
        Map<UUID, QuizResponse> quizzesByStepId = quizEntities.stream()
                .collect(Collectors.toMap(
                        quiz -> quiz.getLearningStepEntity().getId(),
                        quiz -> {
                            List<QuizQuestion> questions = questionsByQuizId.getOrDefault(quiz.getId(), List.of());

                            List<QuizQuestionResponse> questionResponses = questions.stream()
                                    .map(q -> {
                                        List<QuizAnswerOptionResponse> optionResponses = optionsByQuestionId.getOrDefault(q.getId(), List.of())
                                                .stream()
                                                .map(opt -> new QuizAnswerOptionResponse(opt.getId(), opt.getAnswerText()))
                                                .toList();

                                        return new QuizQuestionResponse(q.getId(), q.getQuestionText(), q.isHasMultipleAnswers(), optionResponses);
                                    }).toList();

                            return new QuizResponse(quiz.getId(), questionResponses);
                        }
                ));

        //  Group Steps by Module ID and Flatten Lesson Data
        Map<UUID, List<LearningStepResponse>> stepsByModuleId = stepEntities.stream()
                .map(entity -> {
                    if (entity.getType().equals(LearningStepType.LESSON)) {
                        // Get the lesson entity from the map
                        LessonEntity lesson = lessonsByStepId.get(entity.getId());
                        // Use the two-argument mapper to flatten lesson fields

                        List<LearningStepResourceResponse> resources =
                                resourcesByStepId.getOrDefault(entity.getId(), List.of());

                        return LearningStepMapper.mapToLearnerResponse(entity, lesson, resources, null);
                    }

                    if (entity.getType().equals(LearningStepType.QUIZ)) {
                        QuizResponse quizResponse = quizzesByStepId.get(entity.getId());
                        return LearningStepMapper.mapToLearnerResponse(entity, null, null, quizResponse);
                    }

                    // Fallback for QUIZ or other types: use the standard one-argument mapper
                    return LearningStepMapper.mapToResponse(entity);
                })
                .collect(Collectors.groupingBy(LearningStepResponse::getModuleId));

        // Build ModuleResponses
        List<ModuleResponse> moduleResponses = moduleEntities.stream()
                .map(m -> new ModuleResponse(
                        m.getId(),
                        m.getTitle(),
                        m.getSequence(),
                        stepsByModuleId.getOrDefault(m.getId(), List.of())
                ))
                .toList();

        return CourseMapper.mapToResponseWithModulesAndLessons(course, moduleResponses, moduleEntities.size(), stepEntities.size());

    }

}

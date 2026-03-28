package dev.marvin.courseservice.module;

import dev.marvin.courseservice.course.CourseEntity;
import dev.marvin.courseservice.course.CourseRepository;
import dev.marvin.courseservice.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ModuleService {
    private final ModuleRepository moduleRepository;
    private final CourseRepository courseRepository;

    @Transactional
    public ModuleResponse create(ModuleRequest request){
        CourseEntity course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> new BadRequestException("Course with id [%s] is invalid".formatted(request.courseId())));

        ModuleEntity moduleEntity = ModuleEntity.builder()
                .sequence(request.sequence())
                .title(request.title())
                .course(course)
                .build();

        moduleEntity = moduleRepository.save(moduleEntity);
        return ModuleMapper.mapToResponse(moduleEntity);
    }



}

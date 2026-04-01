package dev.marvin.courseservice.learningstep;

import dev.marvin.courseservice.exception.BadRequestException;
import dev.marvin.courseservice.lesson.LessonEntity;
import dev.marvin.courseservice.lesson.LessonRepository;
import dev.marvin.courseservice.module.ModuleEntity;
import dev.marvin.courseservice.module.ModuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class LearningStepService {
    private final ModuleRepository moduleRepository;
    private final LearningStepRepository learningStepRepository;
    private final LessonRepository lessonRepository;
    private final ApplicationEventPublisher applicationEventPublisher;
    private final LearningStepResourceRepository learningStepResourceRepository;

    @Transactional
    public LearningStepResponse create(LearningStepRequest request) {
        validateStep(request);
        ModuleEntity module = moduleRepository.findById(request.moduleId())
                .orElseThrow(() -> new BadRequestException("Module with id [%s] is invalid".formatted(request.moduleId())));

        LearningStepEntity learningStepEntity = LearningStepEntity.builder()
                .module(module)
                .title(request.title())
                .type(request.type())
                .sequence(request.sequence())
                .videoEnabled(request.videoEnabled())
                .contentEnabled(request.contentEnabled())
                .materialsEnabled(request.materialsEnabled())
                .build();

        // Persist parent to generate ID
        learningStepEntity = learningStepRepository.save(learningStepEntity);

        // 3. Handle Resources
        if (request.materialsEnabled() && request.resources() != null) {
            for (var resourceReq : request.resources()) {
                LearningStepResourceEntity resource = LearningStepResourceEntity.builder()
                        .learningStepEntity(learningStepEntity) // Linked to saved parent
                        .name(resourceReq.name())
                        .objectKey(resourceReq.objectKey())
                        .contentType(resourceReq.contentType())
                        .size(resourceReq.size())
                        .build();
                learningStepResourceRepository.save(resource);
            }
        }

        if (request.type().equals(LearningStepType.LESSON)) {
            LessonEntity lessonEntity = LessonEntity.builder()
                    .content(request.content())
                    .learningStepEntity(learningStepEntity)
                    .videoUploadId(request.videoUploadId())
                    .build();
            lessonRepository.save(lessonEntity);

        }

        if (request.type().equals(LearningStepType.QUIZ)) {
        }

        return LearningStepMapper.mapToResponse(learningStepEntity);
    }


    private void validateStep(LearningStepRequest request) {
        if (request.type().equals(LearningStepType.LESSON)) {

            // 1. If Content Toggle is ON, String must not be blank
            if (request.contentEnabled() && (request.content() == null || request.content().isBlank())) {
                throw new BadRequestException("Content is enabled but no text was provided.");
            }

            // 2. If Video Toggle is ON, we must have a Mux Upload ID
            if (request.videoEnabled() && (request.videoUploadId() == null || request.videoUploadId().isBlank())) {
                throw new BadRequestException("Video is enabled but no video was uploaded.");
            }

            // 3. If Materials Toggle is ON, the list must not be empty
            if (request.materialsEnabled() && (request.resources() == null || request.resources().isEmpty())) {
                throw new BadRequestException("Materials are enabled but no files were attached.");
            }

        }

        if (request.type().equals(LearningStepType.QUIZ) && (request.questions() == null || request.questions().isEmpty())) {
            throw new BadRequestException("Quiz type requires at least one question.");
        }

    }

    @Transactional
    public void deleteLearningStep() {
    }
}

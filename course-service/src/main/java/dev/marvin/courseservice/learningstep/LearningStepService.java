package dev.marvin.courseservice.learningstep;

import dev.marvin.courseservice.exception.BadRequestException;
import dev.marvin.courseservice.exception.ResourceNotFoundException;
import dev.marvin.courseservice.lesson.LessonEntity;
import dev.marvin.courseservice.lesson.LessonRepository;
import dev.marvin.courseservice.module.ModuleEntity;
import dev.marvin.courseservice.module.ModuleRepository;
import dev.marvin.courseservice.storage.mux.MuxVideoUploadService;
import dev.marvin.courseservice.storage.rustfs.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class LearningStepService {
    private final ModuleRepository moduleRepository;
    private final LearningStepRepository learningStepRepository;
    private final LessonRepository lessonRepository;
    private final ApplicationEventPublisher applicationEventPublisher;
    private final LearningStepResourceRepository learningStepResourceRepository;
    private final MuxVideoUploadService muxVideoService;
    private final S3Service s3Service;

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


    private void validateStep(BaseLearningStepRequest request) {
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
    public LearningStepResponse update(UUID learningStepId, LearningStepUpdateRequest request) {
        validateStep(request);

        // 1. Fetch the existing entity
        LearningStepEntity learningStep = learningStepRepository.findById(learningStepId)
                .orElseThrow(() -> new ResourceNotFoundException("Learning step with id [%s] not found".formatted(learningStepId)));

        // 2. Update metadata
        learningStep.setTitle(request.title());
        learningStep.setVideoEnabled(request.videoEnabled());
        learningStep.setContentEnabled(request.contentEnabled());
        learningStep.setMaterialsEnabled(request.materialsEnabled());


        // 3. DEFENSIVE LESSON CLEANUP (Mux)
        if (learningStep.getType().equals(LearningStepType.LESSON)) {
            lessonRepository.findByLearningStepEntity_Id(learningStep.getId()).ifPresentOrElse(
                    lessonEntity -> {
                        lessonEntity.setContent(request.content());

                        // Logic: If (Toggled Off) OR (New Upload ID provided)
                        boolean toggledOff = !request.videoEnabled();
                        boolean videoChanged = request.videoUploadId() != null && !request.videoUploadId().equals(lessonEntity.getVideoUploadId());

                        if ((toggledOff || videoChanged) && lessonEntity.getVideoAssetId() != null) {
                            // Delete from Mux Cloud
                            muxVideoService.deleteAsset(lessonEntity.getVideoAssetId());

                            // Wipe DB playback info
                            lessonEntity.setVideoAssetId(null);
                            lessonEntity.setVideoPlaybackId(null);
                        }

                        lessonEntity.setVideoUploadId(toggledOff ? null : request.videoUploadId());
                        lessonRepository.save(lessonEntity);


                    }, () -> log.warn("Lesson not found for learning step with id [{}]", learningStepId)
            );
        }


        // 4. DEFENSIVE RESOURCE CLEANUP (S3)
        // If toggled off OR the list is empty, delete orphans
        List<LearningStepResourceEntity> learningStepResourceEntities = learningStepResourceRepository.findByLearningStepEntity_Id(learningStepId);
        if (!request.materialsEnabled() || request.resources().isEmpty()) {
            if (learningStepResourceEntities != null && !learningStepResourceEntities.isEmpty()) {
                for (var resource : learningStepResourceEntities) {
                    s3Service.deleteFile(resource.getObjectKey()); // Purge S3
                }
                learningStepResourceRepository.deleteAll(learningStepResourceEntities);
            }
        } else {
            // SYNC: We need to remove what's no longer in the request
            // Simplest approach: Delete existing and re-save the current list from the request
            if (learningStepResourceEntities != null && !learningStepResourceEntities.isEmpty()) {
                // Optional: Only delete files from S3 that are NOT in the new request
                for (var existing : learningStepResourceEntities) {
                    boolean stillExists = request.resources().stream()
                            .anyMatch(r -> r.objectKey().equals(existing.getObjectKey()));

                    if (!stillExists) {
                        s3Service.deleteFile(existing.getObjectKey());
                    }
                }
                learningStepResourceRepository.deleteAll(learningStepResourceEntities);
            }

            // Save the current state from the request
            for (var resReq : request.resources()) {
                LearningStepResourceEntity resource = LearningStepResourceEntity.builder()
                        .learningStepEntity(learningStep)
                        .name(resReq.name())
                        .objectKey(resReq.objectKey())
                        .contentType(resReq.contentType())
                        .size(resReq.size())
                        .build();
                learningStepResourceRepository.save(resource);
            }
        }


        // 5. Handle Quiz Logic
        if (learningStep.getType().equals(LearningStepType.QUIZ)) {
            // Implementation for quiz question updates would go here
        }

        // Save parent and return
        LearningStepEntity updatedStep = learningStepRepository.save(learningStep);
        return LearningStepMapper.mapToResponse(updatedStep);
    }

    @Transactional
    public void delete(UUID learningStepId) {
        // 1. Fetch the entity (Ensures it exists before we try to wipe cloud assets)
        LearningStepEntity learningStep = learningStepRepository.findById(learningStepId)
                .orElseThrow(() -> new ResourceNotFoundException("Learning step with id [%s] not found".formatted(learningStepId)));

        // 2. MUX CLEANUP (If it's a Lesson)
        if (learningStep.getType() == LearningStepType.LESSON) {
            lessonRepository.findByLearningStepEntity_Id(learningStepId).ifPresent(lesson -> {
                if (lesson.getVideoAssetId() != null && !lesson.getVideoPlaybackId().isBlank()) {
                    log.info("Deleting Mux Asset for lesson: {}", lesson.getVideoAssetId());
                    muxVideoService.deleteAsset(lesson.getVideoAssetId());
                } else if (!StringUtils.hasText(lesson.getVideoUploadId())) {
                    log.info("Deleting Mux Upload: {}", lesson.getVideoUploadId());
                    muxVideoService.deleteUpload(lesson.getVideoUploadId());
                }
                lessonRepository.delete(lesson);
            });
        }

        // 3. S3 CLEANUP (If it has materials)
        List<LearningStepResourceEntity> resources = learningStepResourceRepository.findByLearningStepEntity_Id(learningStepId);
        if (resources != null && !resources.isEmpty()) {
            log.info("Purging {} S3 resources for step: {}", resources.size(), learningStepId);
            for (var resource : resources) {
                s3Service.deleteFile(resource.getObjectKey());
                resource.setLearningStepEntity(null);
            }
            // Use deleteAllInBatch for efficiency
            learningStepResourceRepository.deleteAllInBatch(resources);
            learningStepResourceRepository.flush(); // ✅ ADD THIS
        }

        // 4. DATABASE PURGE
        // Depending on your JPA Cascade settings, this may also delete the Lesson record
        learningStepRepository.delete(learningStep);

        log.info("Successfully deleted learning step {} and all associated cloud assets.", learningStepId);
    }
}


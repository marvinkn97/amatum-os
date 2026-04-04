package dev.marvin.courseservice.learningstep;

import dev.marvin.courseservice.exception.BadRequestException;
import dev.marvin.courseservice.exception.ResourceNotFoundException;
import dev.marvin.courseservice.lesson.LessonEntity;
import dev.marvin.courseservice.lesson.LessonRepository;
import dev.marvin.courseservice.module.ModuleEntity;
import dev.marvin.courseservice.module.ModuleRepository;
import dev.marvin.courseservice.storage.mux.MuxAsset;
import dev.marvin.courseservice.storage.mux.MuxAssetRepository;
import dev.marvin.courseservice.storage.mux.MuxVideoUploadService;
import dev.marvin.courseservice.storage.rustfs.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

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
    private final MuxAssetRepository muxAssetRepository;

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


        List<LearningStepResourceEntity> learningStepResourceEntityList = new ArrayList<>();
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
                learningStepResourceEntityList.add(resource); // ✅ ADD THIS
            }
        }

        learningStepResourceRepository.saveAll(learningStepResourceEntityList);

        List<LearningStepResourceResponse> resourceResponses =
                learningStepResourceEntityList.stream()
                        .map(r -> new LearningStepResourceResponse(
                                r.getId(),
                                r.getName(),
                                r.getObjectKey(),
                                r.getObjectKey() != null
                                        ? s3Service.generatePresignedUrl(r.getObjectKey())
                                        : null,
                                r.getContentType(),
                                r.getSize()
                        ))
                        .toList();

        LessonEntity lesson = null;

        if (request.type().equals(LearningStepType.LESSON)) {
            LessonEntity lessonEntity = new LessonEntity();
            lessonEntity.setContent(request.content());
            lessonEntity.setLearningStepEntity(learningStepEntity);
            lessonEntity.setVideoUploadId(request.videoUploadId());

            // 🔗 Sync with MuxAsset if webhook already came
            if (request.videoUploadId() != null) {
                muxAssetRepository.findByUploadId(request.videoUploadId())
                        .ifPresent(muxAsset -> {
                            if (muxAsset.getPlaybackId() != null && muxAsset.getAssetId() != null) {
                                lessonEntity.setVideoPlaybackId(muxAsset.getPlaybackId());
                                lessonEntity.setVideoAssetId(muxAsset.getAssetId());
                                muxAsset.setProcessed(true);
                                muxAssetRepository.save(muxAsset);
                            }
                        });
            }
            lesson = lessonRepository.save(lessonEntity);
        }

        if (request.type().equals(LearningStepType.QUIZ)) {
        }


        return LearningStepMapper.mapToResponse(learningStepEntity, lesson, resourceResponses);
    }


    @Transactional
    public LearningStepResponse update(UUID learningStepId, LearningStepUpdateRequest request) {
        log.info("Updating learning step with id: {}", learningStepId);

        // 1. Fetch LearningStepEntity
        LearningStepEntity learningStep = learningStepRepository.findById(learningStepId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Learning step with id [%s] not found".formatted(learningStepId)));

        // 2. Update basic metadata
        learningStep.setTitle(request.title());
        learningStep.setVideoEnabled(request.videoEnabled());
        learningStep.setContentEnabled(request.contentEnabled());
        learningStep.setMaterialsEnabled(request.materialsEnabled());

        // 3. Handle Lesson (Video + Content)
        LessonEntity lessonEntity = lessonRepository
                .findByLearningStepEntity_Id(learningStep.getId())
                .orElse(null);

        if (lessonEntity != null) {
            log.info("Found existing lesson for learning step: {}", learningStepId);

            // === VIDEO ===
            if (!request.videoEnabled()) {
                log.info("Disabling video for lesson: {}", lessonEntity.getId());
                muxVideoService.deleteAsset(lessonEntity.getVideoAssetId());
                lessonEntity.setVideoAssetId(null);
                lessonEntity.setVideoPlaybackId(null);
                lessonEntity.setVideoUploadId(null);
            } else {
                log.info("Updating video for lesson: {}", lessonEntity.getId());
                String videoUploadId = request.videoUploadId();

                if (StringUtils.hasText(videoUploadId)) {
                    log.info("Updating video upload ID: {}", videoUploadId);
                    muxVideoService.deleteAsset(lessonEntity.getVideoAssetId());
                    lessonEntity.setVideoAssetId(null);
                    lessonEntity.setVideoPlaybackId(null);
                    lessonEntity.setVideoUploadId(videoUploadId);

                    // Get muxAsset and update if ready
                    MuxAsset muxAsset = muxAssetRepository.findByUploadId(videoUploadId).orElse(null);
                    if (muxAsset != null &&
                            muxAsset.getPlaybackId() != null &&
                            muxAsset.getAssetId() != null) {
                        log.info("MuxAsset found for upload ID: {}", videoUploadId);

                        lessonEntity.setVideoPlaybackId(muxAsset.getPlaybackId());
                        lessonEntity.setVideoAssetId(muxAsset.getAssetId());
                        muxAsset.setProcessed(true);
                        muxAssetRepository.save(muxAsset);
                        log.info("MuxAsset updated for upload ID: {}", videoUploadId);
                    }
                }
            }

            // === CONTENT ===
            if (!request.contentEnabled()) {
                log.info("Disabling content for lesson: {}", lessonEntity.getId());
                lessonEntity.setContent(null);
            } else if (!StringUtils.hasText(request.content())) {
                log.info("Content is enabled but no text was provided.");
                throw new BadRequestException("Content is enabled but no text was provided.");
            } else {
                log.info("Updating content for lesson: {}", lessonEntity.getId());
                lessonEntity.setContent(request.content());
            }

            lessonEntity = lessonRepository.save(lessonEntity);
        }

        // 4. Handle Resource Materials
        List<LearningStepResourceEntity> existingResources =
                learningStepResourceRepository.findByLearningStepEntity_Id(learningStepId);

        if (!request.materialsEnabled()) {
            log.info("Disabling materials for learning step: {}", learningStepId);
            if (!existingResources.isEmpty()) {
                log.info("Deleting {} existing resources for learning step: {}", existingResources.size(), learningStepId);
                for (var resource : existingResources) {
                    log.info("Deleting S3 file for resource: {}", resource.getObjectKey());
                    s3Service.deleteFile(resource.getObjectKey());
                    resource.setLearningStepEntity(null);
                }
            }
            learningStepResourceRepository.deleteAll(existingResources);
        } else {
            log.info("Updating materials for learning step: {}", learningStepId);
            if (request.resources() == null || request.resources().isEmpty()) {
                log.info("Materials are enabled but no files were provided.");
                throw new BadRequestException("Materials are enabled but no files were provided.");
            }

            // Delete resources that are no longer requested
            for (LearningStepResourceEntity existing : existingResources) {
                log.info("Checking if resource {} still exists", existing.getObjectKey());
                boolean stillExists = request.resources().stream()
                        .anyMatch(r -> r.objectKey().equals(existing.getObjectKey()));

                if (!stillExists) {
                    log.info("Deleting resource {} because it's no longer requested", existing.getObjectKey());
                    s3Service.deleteFile(existing.getObjectKey());
                    learningStepResourceRepository.delete(existing);
                }
            }

            // Add newly requested resources
            for (LearningStepResourceRequest resReq : request.resources()) {
                log.info("Adding resource: {}", resReq.objectKey());
                boolean alreadyExists = existingResources.stream()
                        .anyMatch(e -> e.getObjectKey().equals(resReq.objectKey()));

                if (!alreadyExists) {
                    log.info("Resource does not exist, creating new one");
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
        }

        // 5. Quiz placeholder
        if (LearningStepType.QUIZ.equals(learningStep.getType())) {
            // TODO: Implement quiz update logic in the future
        }

        // 6. Save the main LearningStepEntity
        LearningStepEntity updatedStep = learningStepRepository.save(learningStep);

        // 7. Fetch fresh resources for the response
        List<LearningStepResourceEntity> updatedResources =
                learningStepResourceRepository.findByLearningStepEntity_Id(learningStepId);

        List<LearningStepResourceResponse> resourceResponses = updatedResources.stream()
                .map(r -> new LearningStepResourceResponse(
                        r.getId(),
                        r.getName(),
                        r.getObjectKey(),
                        s3Service.generatePresignedUrl(r.getObjectKey()),
                        r.getContentType(),
                        r.getSize()))
                .toList();

        // 8. Return response
        return LearningStepMapper.mapToResponse(updatedStep, lessonEntity, resourceResponses);
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
}


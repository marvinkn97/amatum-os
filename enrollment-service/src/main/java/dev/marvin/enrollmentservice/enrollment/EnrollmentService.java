package dev.marvin.enrollmentservice.enrollment;

import dev.marvin.course.proto.BulkCourseSummaryResponse;
import dev.marvin.enrollmentservice.certificate.CertificateRequest;
import dev.marvin.enrollmentservice.certificate.CertificateResponse;
import dev.marvin.enrollmentservice.certificate.CertificateService;
import dev.marvin.enrollmentservice.exception.BadRequestException;
import dev.marvin.enrollmentservice.exception.EnrollmentStatus;
import dev.marvin.enrollmentservice.exception.ResourceNotFoundException;
import dev.marvin.enrollmentservice.grpc.CourseServiceGrpcClient;
import dev.marvin.enrollmentservice.learningstepprogress.LearningStepProgressEntity;
import dev.marvin.enrollmentservice.learningstepprogress.LearningStepProgressRepository;
import dev.marvin.enrollmentservice.learningstepprogress.LearningStepProgressResponse;
import dev.marvin.enrollmentservice.quizattempt.QuizAttemptRequest;
import dev.marvin.enrollmentservice.quizattempt.QuizAttemptResponse;
import dev.marvin.enrollmentservice.quizattempt.QuizAttemptService;
import dev.marvin.enrollmentservice.security.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EnrollmentService {
    private final EnrollmentRepository enrollmentRepository;
    private final CourseServiceGrpcClient courseServiceGrpcClient;
    private final LearningStepProgressRepository learningStepProgressRepository;
    private final QuizAttemptService quizAttemptService;
    private final CertificateService certificateService;

    @Transactional
    public EnrollmentResponse enroll(EnrollmentRequest enrollmentRequest, Authentication authentication) {
        UUID learnerId = UUID.fromString(authentication.getName());
        UUID courseId = enrollmentRequest.courseId();
        log.info("Enrolling learner {} for course {}", learnerId, courseId);

        if (enrollmentRepository.existsByLearnerIdAndCourseId(learnerId, courseId)) {
            log.info("Learner {} already enrolled in course {}", learnerId, courseId);
            throw new BadRequestException("Learner already enrolled in course");
        }

        String activeTenantId = TenantContext.TENANT_ID.isBound() ? TenantContext.TENANT_ID.get() : null;

        EnrollmentEntity enrollmentEntity = EnrollmentEntity.builder()
                .courseId(courseId)
                .learnerId(learnerId)
                .status(EnrollmentStatus.ACTIVE)
                .tenantId(activeTenantId)
                .build();

        EnrollmentEntity savedEnrollment = enrollmentRepository.save(enrollmentEntity);
        log.info("Enrollment saved with id {}", savedEnrollment.getId());
        return EnrollmentMapper.mapToResponse(savedEnrollment);
    }


    @Transactional(readOnly = true)
    public Page<EnrollmentResponse> getActiveEnrollmentsByLearnerIdAndTenantId(Authentication authentication, Pageable pageable) {
        UUID learnerId = UUID.fromString(authentication.getName());
        String activeTenantId = TenantContext.TENANT_ID.isBound() ? TenantContext.TENANT_ID.get() : null;

        log.info("Getting active enrollments for learner {} and tenant {}", learnerId, activeTenantId);
        Page<EnrollmentEntity> enrollments =
                enrollmentRepository.findByLearnerIdAndTenantIdAndStatus(
                        learnerId,
                        activeTenantId,
                        EnrollmentStatus.ACTIVE,
                        pageable
                );

        List<String> courseIds = enrollments.getContent().stream()
                .map(e -> e.getCourseId().toString())
                .distinct()
                .toList();

        BulkCourseSummaryResponse grpcResponse = courseServiceGrpcClient.getMultipleCourseSummaries(courseIds);

        Map<UUID, EnrollmentResponse.CourseSummaryDto> courseMap =
                grpcResponse.getCoursesList().stream()
                        .collect(Collectors.toMap(
                                c -> UUID.fromString(c.getId()),
                                c -> new EnrollmentResponse.CourseSummaryDto(
                                        UUID.fromString(c.getId()),
                                        c.getTitle(),
                                        c.getSlug()
                                )
                        ));

        return enrollments.map(enrollment -> {
            EnrollmentResponse.CourseSummaryDto course = courseMap.get(enrollment.getCourseId());
            return EnrollmentMapper.mapToResponse(enrollment, course);
        });
    }

    @Transactional(readOnly = true)
    public Page<EnrollmentResponse> getCompletedEnrollmentsByLearnerId(Authentication authentication, Pageable pageable) {
        UUID learnerId = UUID.fromString(authentication.getName());
        String activeTenantId = TenantContext.TENANT_ID.isBound() ? TenantContext.TENANT_ID.get() : null;

        log.info("Getting completed enrollments for learner {} and tenant {}", learnerId, activeTenantId);
        Page<EnrollmentEntity> enrollments =
                enrollmentRepository.findByLearnerIdAndTenantIdAndStatus(
                        learnerId,
                        activeTenantId,
                        EnrollmentStatus.COMPLETED,
                        pageable
                );

        List<String> courseIds = enrollments.getContent().stream()
                .map(e -> e.getCourseId().toString())
                .distinct()
                .toList();

        BulkCourseSummaryResponse grpcResponse = courseServiceGrpcClient.getMultipleCourseSummaries(courseIds);

        Map<UUID, EnrollmentResponse.CourseSummaryDto> courseMap =
                grpcResponse.getCoursesList().stream()
                        .collect(Collectors.toMap(
                                c -> UUID.fromString(c.getId()),
                                c -> new EnrollmentResponse.CourseSummaryDto(
                                        UUID.fromString(c.getId()),
                                        c.getTitle(),
                                        c.getSlug()
                                )
                        ));

        return enrollments.map(enrollment -> {
            EnrollmentResponse.CourseSummaryDto course = courseMap.get(enrollment.getCourseId());
            return EnrollmentMapper.mapToResponse(enrollment, course);
        });
    }

    @Transactional(readOnly = true)
    public List<EnrollmentCheckResponse> getEnrollmentStatus(List<UUID> courseIds, UUID learnerId) {
        log.info("Getting enrollment status for courses {} and learner {}", courseIds, learnerId);

        // fetch all enrolled courses in one query
        List<EnrollmentEntity> enrollments =
                enrollmentRepository.findByLearnerIdAndCourseIdIn(learnerId, courseIds);

        Set<UUID> enrolledCourseIds = enrollments.stream()
                .map(EnrollmentEntity::getCourseId)
                .collect(Collectors.toSet());

        // map all requested courses -> response
        return courseIds.stream()
                .map(courseId -> new EnrollmentCheckResponse(
                        courseId,
                        enrolledCourseIds.contains(courseId)
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public EnrollmentCheckResponse checkEnrollmentStatus(UUID courseId, UUID learnerId) {
        log.info("Checking enrollment status for course {} and learner {}", courseId, learnerId);
        boolean exists = enrollmentRepository.existsByLearnerIdAndCourseId(learnerId, courseId);

        log.debug("Enrollment status for course {} and learner {} is {}", courseId, learnerId, exists);
        return new EnrollmentCheckResponse(courseId, exists);
    }

    @Transactional(readOnly = true)
    public EnrollmentResponse getEnrollmentById(UUID enrollmentId, Authentication authentication) {
        log.info("Getting enrollment with id {}", enrollmentId);
        UUID learnerId = UUID.fromString(authentication.getName());

        // Load enrollment
        EnrollmentEntity enrollment = enrollmentRepository
                .findByIdAndLearnerId(enrollmentId, learnerId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Enrollment with given id [%s] not found".formatted(enrollmentId)
                        )
                );

        // gRPC call - course structure
        var course = courseServiceGrpcClient
                .getCourseDetails(enrollment.getCourseId().toString());

        log.info("Course details fetched for course {}", enrollment.getCourseId());

        // Load the progress map (stepId -> progress entity)
        Map<UUID, LearningStepProgressEntity> progressMap =
                learningStepProgressRepository
                        .findByEnrollment_IdAndLearnerId(enrollmentId, learnerId)
                        .stream()
                        .collect(Collectors.toMap(
                                LearningStepProgressEntity::getLearningStepId,
                                p -> p,
                                (a, b) -> a // safety in case of duplicates
                        ));

        // Build course response with progress injection
        EnrollmentResponse.CourseResponse courseResponse =
                new EnrollmentResponse.CourseResponse(
                        UUID.fromString(course.getId()),
                        course.getTitle(),
                        course.getSlug(),
                        course.getDescription(),

                        course.getModulesList().stream().map(module ->
                                new EnrollmentResponse.ModuleResponse(
                                        UUID.fromString(module.getId()),
                                        module.getTitle(),
                                        module.getSequence(),

                                        module.getLearningStepsList().stream().map(step -> {

                                            UUID stepId = UUID.fromString(step.getId());
                                            LearningStepProgressEntity progress = progressMap.get(stepId);

                                            return new EnrollmentResponse.LearningStepDto(
                                                    stepId,
                                                    step.getTitle(),
                                                    step.getType(),
                                                    step.getSequence(),
                                                    step.getVideoEnabled(),
                                                    step.getContentEnabled(),
                                                    step.getMaterialsEnabled(),
                                                    step.getContent(),
                                                    step.getVideoPlaybackId(),

                                                    // resources
                                                    step.getResourcesList().stream().map(r ->
                                                            new EnrollmentResponse.ResourceDto(
                                                                    UUID.fromString(r.getId()),
                                                                    r.getName(),
                                                                    r.getS3PreSignedUrl(),
                                                                    r.getContentType(),
                                                                    r.getSize()
                                                            )
                                                    ).toList(),

                                                    // quiz
                                                    step.hasQuiz()
                                                            ? new EnrollmentResponse.QuizDto(
                                                            UUID.fromString(step.getQuiz().getId()),
                                                            step.getQuiz().getQuestionsList().stream().map(q ->
                                                                                                           new EnrollmentResponse.QuestionDto(
                                                                                                                   UUID.fromString(q.getId()),
                                                                                                                   q.getQuestionText(),
                                                                                                                   q.getHasMultipleCorrectAnswers(),
                                                                                                                   q.getAnswersList().stream().map(a ->
                                                                                                                                                   new EnrollmentResponse.AnswerDto(
                                                                                                                                                           UUID.fromString(a.getId()),
                                                                                                                                                           a.getAnswerText()
                                                                                                                                                   )
                                                                                                                   ).toList()
                                                                                                           )
                                                            ).toList()
                                                    )
                                                            : null,

                                                    // progress injection (THIS is the new life layer)
                                                    progress != null
                                                            ? new LearningStepProgressResponse(
                                                            true,
                                                            progress.getCompletedAt()
                                                    )
                                                            : new LearningStepProgressResponse(false, null)
                                            );
                                        }).toList()
                                )
                        ).toList()
                );

        // 5. Final response
        return new EnrollmentResponse(
                enrollment.getId(),
                enrollment.getStatus(),
                enrollment.isCompleted(),
                enrollment.getProgress(),
                enrollment.getLastLearningStepId(),
                enrollment.getUpdatedAt(),
                courseResponse
        );
    }

    @Transactional
    public void markLearningStepAsCompleted(UUID enrollmentId, UUID stepId, Authentication authentication) {
        log.info("Marking learning step {} as completed for enrollment {}", stepId, enrollmentId);
        UUID learnerId = UUID.fromString(authentication.getName());

        EnrollmentEntity enrollmentEntity = enrollmentRepository.findByIdAndLearnerId(enrollmentId, learnerId)
                .orElseThrow(() -> new BadRequestException("Enrollment with given id [%s] not found".formatted(enrollmentId)));

        if (learningStepProgressRepository.existsByEnrollment_IdAndLearnerIdAndLearningStepIdAndIsCompleted(enrollmentId, learnerId, stepId, true)) {
            throw new BadRequestException("Learning step already marked as completed");
        }

        createStepProgress(enrollmentEntity, learnerId, stepId);
        updateEnrollmentProgress(enrollmentEntity, stepId);
    }

    @Transactional
    public QuizAttemptResponse submitQuiz(UUID enrollmentId, UUID stepId, QuizAttemptRequest quizAttemptRequest, Authentication authentication) {
        log.info("Submitting quiz attempt for enrollment {}", enrollmentId);

        UUID learnerId = UUID.fromString(authentication.getName());

        EnrollmentEntity enrollmentEntity = enrollmentRepository.findByIdAndLearnerId(enrollmentId, learnerId)
                .orElseThrow(() -> new BadRequestException("Enrollment with given id [%s] not found".formatted(enrollmentId)));


        if (!learningStepProgressRepository.existsByEnrollment_IdAndLearnerIdAndLearningStepIdAndIsCompleted(enrollmentId, learnerId, stepId, true)) {
            createStepProgress(enrollmentEntity, learnerId, stepId);
            updateEnrollmentProgress(enrollmentEntity, stepId);
        }

        QuizAttemptResponse attemptResponse =  quizAttemptService.submitQuizAttempt(stepId, quizAttemptRequest, learnerId);

        log.info("Quiz attempt submitted for enrollment {} and learner {}", enrollmentId, learnerId);

        return attemptResponse;
    }


    private void createStepProgress(EnrollmentEntity enrollment, UUID learnerId, UUID stepId) {
        log.info("Creating step progress for enrollment {} and learner {}", enrollment.getId(), learnerId);
        LearningStepProgressEntity progress = new LearningStepProgressEntity();
        progress.setEnrollment(enrollment);
        progress.setLearnerId(learnerId);
        progress.setLearningStepId(stepId);
        progress.setCompleted(true);
        progress.setCompletedAt(Instant.now());
        learningStepProgressRepository.save(progress);
    }

    private void updateEnrollmentProgress(EnrollmentEntity enrollmentEntity, UUID stepId) {
        log.info("Updating enrollment progress for enrollment {}", enrollmentEntity.getId());
        enrollmentEntity.setLastLearningStepId(stepId);
        enrollmentEntity.setCompletedSteps(enrollmentEntity.getCompletedSteps() + 1);

        long totalSteps = courseServiceGrpcClient
                .getCourseTotalSteps(enrollmentEntity.getCourseId().toString())
                .getTotalSteps();

        long completedSteps = enrollmentEntity.getCompletedSteps();

        int progressValue = 0;
        if (totalSteps > 0) {
            progressValue = (int) Math.min(Math.round((completedSteps * 100.0) / totalSteps), 100);
        }

        enrollmentEntity.setProgress(progressValue);

        if (!enrollmentEntity.isCompleted() && completedSteps >= totalSteps) {
            enrollmentEntity.setCompleted(true);
            enrollmentEntity.setStatus(EnrollmentStatus.COMPLETED);
            enrollmentEntity.setCompletedAt(Instant.now());
        }

        enrollmentRepository.save(enrollmentEntity);
    }


    public CertificateResponse claimCertificate(UUID enrollmentId, Authentication authentication) {
        log.info("Claiming certificate for enrollment {}", enrollmentId);
        UUID learnerId = UUID.fromString(authentication.getName());

        EnrollmentEntity enrollmentEntity = enrollmentRepository.findByIdAndLearnerId(enrollmentId, learnerId)
                .orElseThrow(() -> new BadRequestException("Enrollment with given id [%s] not found".formatted(enrollmentId)));

        if (!enrollmentEntity.isCompleted()) {
            throw new BadRequestException("Course must be completed before claiming a certificate");
        }

        return certificateService.issueCertificate(new CertificateRequest(
                learnerId,
                enrollmentEntity.getCourseId(),
                enrollmentId,
                enrollmentEntity.getTenantId()));
    }

}

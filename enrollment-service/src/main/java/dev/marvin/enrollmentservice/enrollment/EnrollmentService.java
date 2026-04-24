package dev.marvin.enrollmentservice.enrollment;

import dev.marvin.enrollmentservice.exception.BadRequestException;
import dev.marvin.enrollmentservice.exception.EnrollmentStatus;
import dev.marvin.enrollmentservice.security.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EnrollmentService {
    private final EnrollmentRepository enrollmentRepository;

    @Transactional
    public EnrollmentResponse enroll(EnrollmentRequest enrollmentRequest, Authentication authentication){
        UUID learnerId = UUID.fromString(authentication.getName());
        UUID courseId = enrollmentRequest.courseId();
        log.info("Enrolling learner {} for course {}", learnerId, courseId);

        if(enrollmentRepository.existsByLearnerIdAndCourseId(learnerId, courseId)){
            log.info("Learner {} already enrolled in course {}", learnerId, courseId);
            throw new BadRequestException("Learner already enrolled in course");
        }

        EnrollmentEntity enrollmentEntity = EnrollmentEntity.builder()
                .courseId(courseId)
                .learnerId(learnerId)
                .status(EnrollmentStatus.ENROLLED)
                .build();

        EnrollmentEntity savedEnrollment = enrollmentRepository.save(enrollmentEntity);
        log.info("Enrollment saved with id {}", savedEnrollment.getId());
        return EnrollmentMapper.mapToResponse(savedEnrollment);
    }

    @Transactional(readOnly = true)
    public Page<EnrollmentResponse> getAllEnrollmentsByLearnerId(Authentication authentication, Pageable pageable){
        UUID learnerId = UUID.fromString(authentication.getName());
        log.info("Getting all enrollments for learner {}", learnerId);

        // 1. Get tenantId from context if it exists (for corporate learners),
        //    otherwise null (for independent marketplace learners).
        String activeTenantId = TenantContext.TENANT_ID.isBound() ? TenantContext.TENANT_ID.get() : null;

        return null;
    }

    @Transactional(readOnly = true)
    public Page<EnrollmentResponse> getActiveEnrollmentsByLearnerId(Authentication authentication, Pageable pageable){
        UUID learnerId = UUID.fromString(authentication.getName());
        log.info("Getting active enrollments for learner {}", learnerId);
        return null;
    }

    @Transactional(readOnly = true)
    public Page<EnrollmentResponse> getCompletedEnrollmentsByLearnerId(Authentication authentication, Pageable pageable){
        UUID learnerId = UUID.fromString(authentication.getName());
        log.info("Getting completed enrollments for learner {}", learnerId);
        return null;
    }

}

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

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EnrollmentService {
    private final EnrollmentRepository enrollmentRepository;

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
                .status(EnrollmentStatus.ENROLLED)
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
        return enrollmentRepository.findByLearnerIdAndTenantIdAndStatus(learnerId, activeTenantId, EnrollmentStatus.ENROLLED, pageable)
                .map(EnrollmentMapper::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<EnrollmentResponse> getCompletedEnrollmentsByLearnerId(Authentication authentication, Pageable pageable) {
        UUID learnerId = UUID.fromString(authentication.getName());
        String activeTenantId = TenantContext.TENANT_ID.isBound() ? TenantContext.TENANT_ID.get() : null;

        log.info("Getting completed enrollments for learner {} and tenant {}", learnerId, activeTenantId);

        return enrollmentRepository.findByLearnerIdAndTenantIdAndStatus(learnerId, activeTenantId, EnrollmentStatus.COMPLETED, pageable)
                .map(EnrollmentMapper::mapToResponse);
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

}

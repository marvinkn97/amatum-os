package dev.marvin.enrollmentservice.enrollment;

import dev.marvin.enrollmentservice.exception.EnrollmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EnrollmentRepository extends JpaRepository<EnrollmentEntity, UUID> {
    boolean existsByLearnerIdAndCourseId(UUID learnerId, UUID courseId);

    List<EnrollmentEntity> findByLearnerIdAndCourseIdIn(UUID learnerId, List<UUID> courseIds);

    Page<EnrollmentEntity> findByLearnerIdAndTenantIdAndStatus(UUID learnerId, String tenantId, EnrollmentStatus status, Pageable pageable);

    Optional<EnrollmentEntity> findByIdAndLearnerId(UUID id, UUID learnerId);

}

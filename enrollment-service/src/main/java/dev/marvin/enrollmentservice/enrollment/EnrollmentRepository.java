package dev.marvin.enrollmentservice.enrollment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface EnrollmentRepository extends JpaRepository<EnrollmentEntity, UUID> {
    boolean existsByLearnerIdAndCourseId(UUID learnerId, UUID courseId);
}

package dev.marvin.enrollmentservice.learningstepprogress;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LearningStepProgressRepository extends JpaRepository<LearningStepProgressEntity, UUID> {
    boolean existsByEnrollment_IdAndLearnerIdAndLearningStepIdAndIsCompleted(UUID enrollmentId, UUID learnerId, UUID learningStepId, boolean isCompleted);

    List<LearningStepProgressEntity> findByEnrollment_IdAndLearnerId(UUID enrollmentId, UUID learnerId);
}

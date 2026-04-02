package dev.marvin.courseservice.learningstep;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LearningStepResourceRepository extends JpaRepository<LearningStepResourceEntity, UUID> {
    List<LearningStepResourceEntity> findByLearningStepEntity_Id(UUID learningStepEntityId);
    List<LearningStepResourceEntity> findByLearningStepEntity_IdIn(List<UUID> learningStepEntityIds);
}

package dev.marvin.courseservice.learningstep;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LearningStepRepository extends JpaRepository<LearningStepEntity, UUID> {
    List<LearningStepEntity> findByModule_IdIn(List<UUID> moduleIds);

    List<LearningStepEntity> findByModule_Id(UUID moduleId);

}

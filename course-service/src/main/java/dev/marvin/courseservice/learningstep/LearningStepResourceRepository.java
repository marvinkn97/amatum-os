package dev.marvin.courseservice.learningstep;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface LearningStepResourceRepository extends JpaRepository<LearningStepResourceEntity, UUID> {
}

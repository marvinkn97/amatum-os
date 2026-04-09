package dev.marvin.courseservice.quiz.quiz;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuizRepository extends JpaRepository<QuizEntity, UUID> {
    Optional<QuizEntity> findByLearningStepEntity_Id(UUID learningStepEntityId);

    List<QuizEntity> findByLearningStepEntity_IdIn(List<UUID> learningStepEntityIds);
}

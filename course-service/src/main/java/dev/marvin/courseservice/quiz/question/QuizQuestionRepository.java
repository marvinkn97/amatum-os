package dev.marvin.courseservice.quiz.question;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, UUID> {
    List<QuizQuestion> findByQuizEntity_Id(UUID quizEntityId);

    List<QuizQuestion> findByQuizEntity_IdIn(List<UUID> quizEntityIds);
}

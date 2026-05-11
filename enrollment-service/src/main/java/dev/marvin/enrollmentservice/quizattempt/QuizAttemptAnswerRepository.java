package dev.marvin.enrollmentservice.quizattempt;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuizAttemptAnswerRepository extends JpaRepository<QuizAttemptAnswerEntity, UUID> {
    List<QuizAttemptAnswerEntity> findByQuizAttempt_Id(UUID quizAttemptId);
}

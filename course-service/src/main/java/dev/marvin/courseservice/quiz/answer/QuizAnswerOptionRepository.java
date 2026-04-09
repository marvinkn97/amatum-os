package dev.marvin.courseservice.quiz.answer;

import dev.marvin.courseservice.quiz.question.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface QuizAnswerOptionRepository extends JpaRepository<QuizAnswerOption, UUID> {
    void deleteAllByQuizQuestionIn(Collection<QuizQuestion> quizQuestions);

    List<QuizAnswerOption> findByQuizQuestion_IdIn(Collection<UUID> quizQuestionIds);
}

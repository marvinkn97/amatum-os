package dev.marvin.enrollmentservice.quizattempt;

import java.util.List;
import java.util.UUID;

public record QuizAttemptResponse(
        UUID id,
        Integer totalQuestions,
        Integer correctCount,
        Integer score,
        Boolean passed,
        List<QuizAttemptAnswerResponse> evaluatedAnswers
) {

}

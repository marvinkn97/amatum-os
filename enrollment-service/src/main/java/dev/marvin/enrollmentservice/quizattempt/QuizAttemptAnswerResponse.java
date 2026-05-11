package dev.marvin.enrollmentservice.quizattempt;

import java.util.List;

public record QuizAttemptAnswerResponse(
        String questionText,
        List<String> selectedOptions,
        List<String> correctOptions,
        Boolean isCorrect
) {
}

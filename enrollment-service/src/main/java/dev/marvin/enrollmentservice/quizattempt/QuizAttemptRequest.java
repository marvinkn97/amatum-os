package dev.marvin.enrollmentservice.quizattempt;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record QuizAttemptRequest(
        @NotNull
        UUID quizId,

        @Valid
        @NotEmpty
        List<QuizAttemptAnswerRequest> selectedAnswers
) {
}

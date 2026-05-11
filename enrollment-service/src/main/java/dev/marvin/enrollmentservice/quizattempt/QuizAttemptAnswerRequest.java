package dev.marvin.enrollmentservice.quizattempt;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.Set;
import java.util.UUID;

public record QuizAttemptAnswerRequest(
        @NotNull
        UUID questionId,

        @NotEmpty
        Set<UUID> selectedAnswerIds
) {
}

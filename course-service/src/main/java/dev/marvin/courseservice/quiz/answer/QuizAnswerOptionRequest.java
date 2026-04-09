package dev.marvin.courseservice.quiz.answer;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record QuizAnswerOptionRequest(
        @NotBlank
        String answerText,

        @NotNull
        boolean isCorrect
) {
}

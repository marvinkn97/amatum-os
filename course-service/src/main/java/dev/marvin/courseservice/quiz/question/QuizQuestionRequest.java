package dev.marvin.courseservice.quiz.question;

import dev.marvin.courseservice.quiz.answer.QuizAnswerOptionRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record QuizQuestionRequest(
        @NotBlank
        String questionText,

        @NotNull
        boolean hasMultipleAnswers,

        @NotNull
        @Valid
        List<QuizAnswerOptionRequest> answerOptions

) {
}

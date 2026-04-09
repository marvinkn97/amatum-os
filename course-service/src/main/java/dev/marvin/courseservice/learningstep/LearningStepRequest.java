package dev.marvin.courseservice.learningstep;

import dev.marvin.courseservice.quiz.question.QuizQuestionRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.List;
import java.util.UUID;

public record LearningStepRequest(
        @NotNull
        UUID moduleId,

        @NotNull
        LearningStepType type,

        @NotBlank
        String title,

        @NotNull
        @Positive
        Integer sequence,

        @NotNull
        boolean videoEnabled,

        @NotNull
        boolean contentEnabled,

        @NotNull
        boolean materialsEnabled,

        String videoUploadId,
        String content,
        @Valid
        List<LearningStepResourceRequest> resources,

        @Valid
        List<QuizQuestionRequest> questions
) {
}

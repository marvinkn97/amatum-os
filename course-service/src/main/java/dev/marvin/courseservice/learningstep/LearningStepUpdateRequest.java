package dev.marvin.courseservice.learningstep;

import dev.marvin.courseservice.quiz.QuizQuestionRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record LearningStepUpdateRequest(
        @NotNull
        LearningStepType type,

        @NotBlank
        String title,

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

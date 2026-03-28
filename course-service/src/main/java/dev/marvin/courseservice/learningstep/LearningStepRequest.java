package dev.marvin.courseservice.learningstep;

import dev.marvin.courseservice.quiz.QuizQuestionRequest;
import dev.marvin.courseservice.storage.rustfs.S3UploadRequest;
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
        Boolean videoEnabled,
        @NotNull
        Boolean contentEnabled,
        @NotNull
        Boolean materialsEnabled,

        String videoUploadId,
        String content,
        @Valid
        List<S3UploadRequest> attachments,

        @Valid
        List<QuizQuestionRequest> questions
) {
}

package dev.marvin.courseservice.learningstep;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LearningStepResourceRequest(
        @NotBlank
        String name,
        @NotBlank
        String objectKey,
        @NotBlank
        String contentType,
        @NotNull
        Long size
) {
}

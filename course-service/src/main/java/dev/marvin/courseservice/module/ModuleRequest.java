package dev.marvin.courseservice.module;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.UUID;

public record ModuleRequest(
        @NotBlank
        String title,

        @NotNull
        @Positive
        Integer sequence,

        @NotNull
        UUID courseId
) {
}

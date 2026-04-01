package dev.marvin.courseservice.module;

import jakarta.validation.constraints.NotBlank;

public record ModuleDetailsUpdateRequest(
        @NotBlank
        String title
) {
}

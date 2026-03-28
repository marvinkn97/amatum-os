package dev.marvin.courseservice.category;

import jakarta.validation.constraints.NotBlank;

public record CategoryRequest(
        @NotBlank
        String name,

        @NotBlank
        String description
) {
}

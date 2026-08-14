package dev.marvin.talemaiservice.api;

import jakarta.validation.constraints.NotBlank;

public record TalemaiRequest(
        @NotBlank
        String question
) {
}

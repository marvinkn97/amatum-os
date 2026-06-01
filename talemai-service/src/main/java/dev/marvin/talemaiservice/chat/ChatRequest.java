package dev.marvin.talemaiservice.chat;

import jakarta.validation.constraints.NotBlank;

public record ChatRequest(
        @NotBlank
        String question
) {
}

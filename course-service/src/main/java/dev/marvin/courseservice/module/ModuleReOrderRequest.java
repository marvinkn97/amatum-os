package dev.marvin.courseservice.module;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ModuleReOrderRequest(
        @NotNull
        UUID moduleId,

        @NotNull
        Integer sequence
) {
}

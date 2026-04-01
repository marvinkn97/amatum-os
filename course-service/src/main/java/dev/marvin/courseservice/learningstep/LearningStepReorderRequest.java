package dev.marvin.courseservice.learningstep;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record LearningStepReorderRequest(
        @NotNull
        UUID learningStepId,

        @NotNull
        Integer sequence
) {
}

package dev.marvin.enrollmentservice;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record EnrollmentRequest(
        @NotNull
        UUID courseId
) {
}

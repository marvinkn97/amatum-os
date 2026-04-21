package dev.marvin.enrollmentservice.enrollment;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record EnrollmentRequest(
        @NotNull
        UUID courseId
) {
}

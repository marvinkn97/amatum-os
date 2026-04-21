package dev.marvin.enrollmentservice.enrollment;

import com.fasterxml.jackson.annotation.JsonInclude;
import dev.marvin.enrollmentservice.exception.EnrollmentStatus;

import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record EnrollmentResponse(
        UUID id,
        EnrollmentStatus status,
        Boolean isCompleted,
        Integer progress
        ) {
}

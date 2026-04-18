package dev.marvin.enrollmentservice;

import java.time.Instant;
import java.util.UUID;

public record EnrollmentResponse(
        UUID enrollmentId,
        UUID courseId,
        UUID learnerId,
        EnrollmentStatus status,
        Boolean isCompleted,
        Instant startTime,
        Instant endTime
        ) {
}

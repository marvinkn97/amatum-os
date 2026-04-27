package dev.marvin.enrollmentservice.enrollment;

import java.util.UUID;

public record EnrollmentCheckResponse(
        UUID courseId,
        boolean isEnrolled
) {
}

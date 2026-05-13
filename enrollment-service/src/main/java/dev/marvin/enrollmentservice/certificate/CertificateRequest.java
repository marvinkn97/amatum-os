package dev.marvin.enrollmentservice.certificate;

import java.util.UUID;

public record CertificateRequest(
        UUID learnerId,
        UUID courseId,
        UUID enrollmentId,
        String tenantId
) {
}

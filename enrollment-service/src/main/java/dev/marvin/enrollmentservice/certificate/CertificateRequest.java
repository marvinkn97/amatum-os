package dev.marvin.enrollmentservice.certificate;

import java.util.UUID;

public record CertificateRequest(
        UUID learnerId,
        String learnerName,

        String enrollmentId,
        UUID courseId
) {
}

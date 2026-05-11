package dev.marvin.enrollmentservice.certificate;

import java.time.LocalDateTime;
import java.util.UUID;

public record CertificateResponse(
        UUID id,
        String certificateUrl,
        LocalDateTime issuedAt
) {
}

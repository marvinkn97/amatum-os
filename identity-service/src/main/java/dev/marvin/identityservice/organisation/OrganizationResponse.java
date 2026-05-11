package dev.marvin.identityservice.organisation;

import java.util.UUID;

public record OrganizationResponse(
        UUID id,
        String name,
        String slug
) {
}

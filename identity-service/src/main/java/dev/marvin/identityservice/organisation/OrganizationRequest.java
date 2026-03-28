package dev.marvin.identityservice.organisation;

import jakarta.validation.constraints.NotBlank;

public record OrganizationRequest(
        @NotBlank
        String name,

        @NotBlank
        String slug,

        @NotBlank
        String domain) {
}

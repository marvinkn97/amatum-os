package dev.marvin.identityservice.organisation;

import jakarta.validation.constraints.NotBlank;

public record OrganizationInvitationRequest(
        @NotBlank
        String email,

        @NotBlank
        String firstName,

        @NotBlank
        String lastName
) {
}
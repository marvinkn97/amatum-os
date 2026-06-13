package dev.marvin.identityservice.organisation;

public record OrganizationInvitationResponse(
        String id,
        String email,
        String firstName,
        String lastName,
        String status
) {}
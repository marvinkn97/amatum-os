package dev.marvin.identityservice;

import java.util.UUID;

public record IdentityResponse(UUID id, String firstName, String lastName, String email) {
}

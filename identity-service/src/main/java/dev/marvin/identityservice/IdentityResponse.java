package dev.marvin.identityservice;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record IdentityResponse(
        UUID id,
        String firstName,
        String lastName,
        String email,
        LocalDateTime joinDate) {

    public IdentityResponse(UUID id, String firstName, String lastName, String email) {
        this(id, firstName, lastName, email, null);
    }
}

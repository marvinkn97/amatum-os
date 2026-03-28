package dev.marvin.identityservice.user;

import jakarta.validation.constraints.NotBlank;

public record NameUpdateRequest(
        @NotBlank
        String firstName,

        @NotBlank
        String lastName
) {
}

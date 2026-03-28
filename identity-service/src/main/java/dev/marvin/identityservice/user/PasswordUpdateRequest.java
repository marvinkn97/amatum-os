package dev.marvin.identityservice.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordUpdateRequest(
        @NotBlank
        @Size(min = 8, max = 20)
        String password
) {
}

package dev.marvin.courseservice.storage.rustfs;

import jakarta.validation.constraints.NotBlank;

public record S3UploadRequest(
        @NotBlank
        String fileName,
        @NotBlank
        String contentType
) {
}

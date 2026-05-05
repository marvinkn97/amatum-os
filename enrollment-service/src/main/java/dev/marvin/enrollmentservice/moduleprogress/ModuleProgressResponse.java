package dev.marvin.enrollmentservice.moduleprogress;

import java.util.UUID;

public record ModuleProgressResponse(
        UUID id,
        Boolean isCompleted
) {
}

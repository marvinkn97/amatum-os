package dev.marvin.enrollmentservice.learningstepprogress;

import java.util.UUID;

public record LearningStepProgressResponse(
        UUID id,
        Boolean isCompleted
) {
}

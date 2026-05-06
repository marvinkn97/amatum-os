package dev.marvin.enrollmentservice.learningstepprogress;

import java.time.Instant;

public record LearningStepProgressResponse(
        Boolean isCompleted,
        Instant completedAt
) {
}

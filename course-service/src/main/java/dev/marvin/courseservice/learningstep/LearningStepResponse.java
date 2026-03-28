package dev.marvin.courseservice.learningstep;

import java.util.UUID;

public record LearningStepResponse(
        UUID id,
        LearningStepType type,
        String title,
        Integer sequence,
        String content,
        UUID moduleId
) {
}

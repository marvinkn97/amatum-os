package dev.marvin.courseservice.learningstep;

import java.util.UUID;

public record LearningStepResourceResponse(UUID id, String name, String url, String contentType, Long size) {
}

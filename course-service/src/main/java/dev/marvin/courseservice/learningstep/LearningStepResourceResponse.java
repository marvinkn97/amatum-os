package dev.marvin.courseservice.learningstep;

import java.util.UUID;

public record LearningStepResourceResponse(UUID id, String name, String objectKey, String s3PreSignedUrl, String contentType, Long size) {
}

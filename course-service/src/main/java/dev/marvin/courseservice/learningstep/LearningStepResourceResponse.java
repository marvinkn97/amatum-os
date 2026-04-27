package dev.marvin.courseservice.learningstep;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record LearningStepResourceResponse(
        UUID id,
        String name,
        String objectKey,
        String s3PreSignedUrl,
        String contentType,
        Long size) {

    public LearningStepResourceResponse(
            UUID id,
            String name,
            String s3PreSignedUrl,
            String contentType,
            Long size) {
        this(id, name, null, s3PreSignedUrl, contentType, size);
    }
}

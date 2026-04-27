package dev.marvin.courseservice.module;

import com.fasterxml.jackson.annotation.JsonInclude;
import dev.marvin.courseservice.common.Status;
import dev.marvin.courseservice.learningstep.LearningStepResponse;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ModuleResponse(
        UUID id,
        String title,
        Integer sequence,
        Status status,
        Boolean isReadyToPublish,
        List<LearningStepResponse> learningSteps) {

    public ModuleResponse(
            UUID id,
            String title,
            Integer sequence,
            Status status) {
        this(id, title, sequence, status, null, Collections.emptyList());
    }

    public ModuleResponse(
            UUID id,
            String title,
            Integer sequence,
            List<LearningStepResponse> learningSteps) {
        this(id, title, sequence, null, null, learningSteps);
    }
}

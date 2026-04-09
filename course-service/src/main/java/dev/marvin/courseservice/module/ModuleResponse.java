package dev.marvin.courseservice.module;

import dev.marvin.courseservice.learningstep.LearningStepResponse;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

public record ModuleResponse(
        UUID id,
        String title,
        Integer sequence,
        Boolean isReadyToPublish,
        List<LearningStepResponse> learningSteps) {
    public ModuleResponse(UUID id, String title, Integer sequence) {
        this(id, title, sequence, null,  Collections.emptyList());
    }
}

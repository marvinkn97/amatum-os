package dev.marvin.courseservice.learningstep;

import com.fasterxml.jackson.annotation.JsonInclude;
import dev.marvin.courseservice.quiz.QuizResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LearningStepResponse {
    private UUID id;
    private UUID moduleId;
    private String title;
    private LearningStepType type;
    private Integer sequence;

    private boolean videoEnabled;
    private boolean contentEnabled;
    private boolean materialsEnabled;


    private String content;
    private String videoPlaybackId;

    private List<LearningStepResourceResponse> resources;
    private QuizResponse quiz;

    // Custom constructor for minimal data initialization
    public LearningStepResponse(UUID id, UUID moduleId, String title, LearningStepType type, Integer sequence) {
        this.id = id;
        this.moduleId = moduleId;
        this.title = title;
        this.type = type;
        this.sequence = sequence;
    }
}
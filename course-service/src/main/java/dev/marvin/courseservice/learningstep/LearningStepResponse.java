package dev.marvin.courseservice.learningstep;

import com.fasterxml.jackson.annotation.JsonInclude;
import dev.marvin.courseservice.lesson.LessonResponse;
import dev.marvin.courseservice.quiz.QuizResponse;

import java.util.List;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record LearningStepResponse(
        UUID id,
        UUID moduleId,
        String title,
        LearningStepType type,
        Integer sequence,

        Boolean videoEnabled,
        Boolean contentEnabled,
        Boolean materialsEnabled,

        List<LearningStepResourceResponse> resources,
        LessonResponse lesson, // Nested lesson data
        QuizResponse quiz      // Nested quiz data
) {

    public LearningStepResponse(UUID id, UUID moduleId, String title, LearningStepType type, Integer sequence) {
        this(
                id,
                moduleId,
                title,
                type,
                sequence,
                null, // videoEnabled
                null, // contentEnabled
                null, // materialsEnabled
                null, // empty resources
                null,  // no lesson data
                null   // no quiz data
        );
    }
}

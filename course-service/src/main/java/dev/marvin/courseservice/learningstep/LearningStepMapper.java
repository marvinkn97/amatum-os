package dev.marvin.courseservice.learningstep;

import dev.marvin.courseservice.lesson.LessonResponse;
import dev.marvin.courseservice.quiz.QuizResponse;

import java.util.List;

public class LearningStepMapper {
    private LearningStepMapper(){}


    public static LearningStepResponse mapToResponse(LearningStepEntity learningStepEntity) {
        return new LearningStepResponse(
                learningStepEntity.getId(),
                learningStepEntity.getModule().getId(),
                learningStepEntity.getTitle(),
                learningStepEntity.getType(),
                learningStepEntity.getSequence()
        );
    }

    public static LearningStepResponse mapToResponse(LearningStepEntity learningStepEntity, List<LearningStepResourceResponse> resourceResponseList, LessonResponse lessonResponse, QuizResponse quizResponse) {
        return new LearningStepResponse(
                learningStepEntity.getId(),
                learningStepEntity.getModule().getId(),
                learningStepEntity.getTitle(),
                learningStepEntity.getType(),
                learningStepEntity.getSequence(),
                learningStepEntity.isVideoEnabled(),
                learningStepEntity.isContentEnabled(),
                learningStepEntity.isMaterialsEnabled(),
                resourceResponseList,
                lessonResponse,
                quizResponse
        );
    }
}

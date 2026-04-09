package dev.marvin.courseservice.learningstep;

import dev.marvin.courseservice.lesson.LessonEntity;
import dev.marvin.courseservice.quiz.quiz.QuizResponse;

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

    public static LearningStepResponse mapToResponse(LearningStepEntity entity, LessonEntity lesson, List<LearningStepResourceResponse> resources, QuizResponse quiz) {
        LearningStepResponse response = mapToResponse(entity); // your existing basic map

        response.setVideoEnabled(entity.isVideoEnabled());
        response.setContentEnabled(entity.isContentEnabled());
        response.setMaterialsEnabled(entity.isMaterialsEnabled());
        response.setReadyToPublish(entity.isReadyToPublish());
        response.setStatus(entity.getStatus());

        if (lesson != null && entity.getType().equals(LearningStepType.LESSON)) {
            response.setContent(lesson.getContent());
            response.setVideoPlaybackId(lesson.getVideoPlaybackId());
            response.setVideoAssetId(lesson.getVideoAssetId());
            response.setResources(resources);
        }

        if(quiz != null && entity.getType().equals(LearningStepType.QUIZ)) {
            response.setQuiz(quiz);
            response.setContent(null);
            response.setVideoPlaybackId(null);
            response.setVideoAssetId(null);
        }

        return response;
    }
}

package dev.marvin.courseservice.learningstep;

import dev.marvin.courseservice.lesson.LessonEntity;

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

    public static LearningStepResponse mapToResponse(LearningStepEntity entity, LessonEntity lesson) {
        LearningStepResponse response = mapToResponse(entity); // your existing basic map

        response.setVideoEnabled(entity.isVideoEnabled());
        response.setContentEnabled(entity.isContentEnabled());
        response.setMaterialsEnabled(entity.isMaterialsEnabled());

        if (lesson != null && entity.getType().equals(LearningStepType.LESSON)) {
            response.setContent(lesson.getContent());
            response.setVideoPlaybackId(lesson.getVideoPlaybackId());
        }
        return response;
    }
}

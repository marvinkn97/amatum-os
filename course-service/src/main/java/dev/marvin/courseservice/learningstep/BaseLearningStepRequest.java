package dev.marvin.courseservice.learningstep;

import dev.marvin.courseservice.quiz.QuizQuestionRequest;

import java.util.List;

public interface BaseLearningStepRequest {
    LearningStepType type();
    String title();
    boolean videoEnabled();
    boolean contentEnabled();
    boolean materialsEnabled();
    String videoUploadId();
    String content();
    List<LearningStepResourceRequest> resources(); // Or whatever your resource DTO is named
    List<QuizQuestionRequest> questions(); // Or whatever your question DTO is named
}
package dev.marvin.courseservice.quiz.quiz;

import dev.marvin.courseservice.quiz.question.QuizQuestionResponse;

import java.util.List;
import java.util.UUID;

public record QuizResponse(
        UUID id,
        List<QuizQuestionResponse> questions
) {
}

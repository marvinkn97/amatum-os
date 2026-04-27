package dev.marvin.courseservice.quiz.answer;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record QuizAnswerOptionResponse(
        UUID id,
        String answerText,
        Boolean isCorrect
) {
    public QuizAnswerOptionResponse(UUID id, String answerText) {
        this(id, answerText, null);
    }
}
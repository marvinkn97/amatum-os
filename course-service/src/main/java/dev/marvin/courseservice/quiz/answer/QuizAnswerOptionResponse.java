package dev.marvin.courseservice.quiz.answer;

import java.util.UUID;

public record QuizAnswerOptionResponse(
        UUID id,
        String answerText,
        boolean isCorrect
) {}
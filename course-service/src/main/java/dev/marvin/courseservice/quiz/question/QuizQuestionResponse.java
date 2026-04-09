package dev.marvin.courseservice.quiz.question;

import dev.marvin.courseservice.quiz.answer.QuizAnswerOptionResponse;

import java.util.List;
import java.util.UUID;

public record QuizQuestionResponse(
        UUID id,
        String questionText,
        boolean hasMultipleAnswers,
        List<QuizAnswerOptionResponse> answerOptions
) {}
package dev.marvin.enrollmentservice.quizattempt;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

import java.util.UUID;

public class QuizAttemptEntity {
    @Id
    @GeneratedValue
    private UUID id;

}

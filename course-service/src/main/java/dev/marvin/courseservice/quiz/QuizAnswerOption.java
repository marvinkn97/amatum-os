package dev.marvin.courseservice.quiz;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Version;

import java.util.UUID;

public class QuizAnswerOption {
    @Id
    @GeneratedValue
    private UUID id;

    @Version
    private Long version;
}

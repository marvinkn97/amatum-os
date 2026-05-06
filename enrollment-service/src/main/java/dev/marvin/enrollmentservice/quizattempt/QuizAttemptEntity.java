package dev.marvin.enrollmentservice.quizattempt;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Version;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

public class QuizAttemptEntity {
    @Id
    @GeneratedValue
    private UUID id;

    @Version
    private Long version;

    private UUID learnerId;

    private UUID quizId;

    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;

}

package dev.marvin.enrollmentservice.quizattempt;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "quiz_attempt_answers")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class QuizAttemptAnswerEntity {
    @Id
    @GeneratedValue
    private UUID id;

    @Version
    private Long version;

    @ManyToOne
    @JoinColumn(name = "quiz_attempt_id")
    private QuizAttemptEntity quizAttempt;

    private UUID questionId;
    private UUID selectedAnswerId;
    private boolean isCorrect;

    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

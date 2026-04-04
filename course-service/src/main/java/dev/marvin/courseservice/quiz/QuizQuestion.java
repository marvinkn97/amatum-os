package dev.marvin.courseservice.quiz;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "quiz_questions",
        indexes = {
        @Index(name = "idx_quiz_question_quiz_id", columnList = "quiz_id")
})
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class QuizQuestion {
    @Id
    @GeneratedValue
    private UUID id;

    @Version
    private Long version;

    @ManyToOne
    @JoinColumn(name = "quiz_id")
    private QuizEntity quizEntity;

    @Column(columnDefinition = "TEXT")
    private String questionText;

    private boolean hasMultipleAnswers;

    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

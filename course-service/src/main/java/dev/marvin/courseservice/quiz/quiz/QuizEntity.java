package dev.marvin.courseservice.quiz.quiz;

import dev.marvin.courseservice.learningstep.LearningStepEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "quizzes",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_quiz_step",
                        columnNames = "learning_step_id"
                )
        }, indexes = {
        @Index(
                name = "idx_quiz_step",
                columnList = "learning_step_id"
        )
})
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class QuizEntity {
    @Id
    @GeneratedValue
    private UUID id;

    @Version
    private Long version;

    @OneToOne
    @JoinColumn(name = "learning_step_id")
    private LearningStepEntity learningStepEntity;

    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

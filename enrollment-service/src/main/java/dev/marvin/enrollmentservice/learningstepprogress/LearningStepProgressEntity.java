package dev.marvin.enrollmentservice.learningstepprogress;


import dev.marvin.enrollmentservice.enrollment.EnrollmentEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "learning_step_progresses",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_enrollment_learner_step",
                        columnNames = {"enrollment_id", "learnerId", "learningStepId"}
                )
        }
)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class LearningStepProgressEntity {
    @Id
    @GeneratedValue
    private UUID id;

    @Version
    private Long version;

    private boolean isCompleted;
    private UUID learnerId;
    private UUID learningStepId;

    private Instant completedAt;

    @ManyToOne
    @JoinColumn(name = "enrollment_id")
    private EnrollmentEntity enrollment;

    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

package dev.marvin.enrollmentservice.enrollment;

import dev.marvin.enrollmentservice.exception.EnrollmentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "enrollments",
        indexes = {
                @Index(name = "idx_enrollment_tenant", columnList = "tenantId"),
                @Index(name = "idx_enrollment_learner", columnList = "learnerId"),
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_enrollment_learner_course",
                        columnNames = {"learnerId", "courseId"}
                )
        }
)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class EnrollmentEntity {
    @Id
    @GeneratedValue
    private UUID id;

    @Version
    private Long version;

    private UUID learnerId;
    private UUID courseId;
    private boolean isCompleted;

    @Enumerated(EnumType.STRING)
    private EnrollmentStatus status;

    private Instant completedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private String tenantId;

    private UUID lastLearningStepId;

    private int progress;
    private int completedSteps;
}

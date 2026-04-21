package dev.marvin.enrollmentservice.learningstepprogress;


import dev.marvin.enrollmentservice.moduleprogress.ModuleProgressEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "learning_step_progresses")
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

    private Instant startTime;
    private Instant endTime;

    @ManyToOne
    @JoinColumn(name = "module_progress_id")
    private ModuleProgressEntity moduleProgress;

    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

package dev.marvin.enrollmentservice.moduleprogress;

import dev.marvin.enrollmentservice.enrollment.EnrollmentEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "module_progresses")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class ModuleProgressEntity {
    @Id
    @GeneratedValue
    private UUID id;

    @Version
    private Long version;

    private UUID learnerId;
    private UUID moduleId;
    private boolean isCompleted;

    @ManyToOne
    @JoinColumn(name = "enrollment_id")
    private EnrollmentEntity enrollment;

    private Instant startTime;
    private Instant endTime;

    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;


}

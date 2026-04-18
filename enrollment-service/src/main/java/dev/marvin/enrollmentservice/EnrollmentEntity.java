package dev.marvin.enrollmentservice;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "enrollments")
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

    private Instant startTime;
    private Instant endTime;

    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

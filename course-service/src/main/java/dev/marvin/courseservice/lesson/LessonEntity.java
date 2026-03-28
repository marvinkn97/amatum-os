package dev.marvin.courseservice.lesson;

import dev.marvin.courseservice.learningstep.LearningStepEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "lessons",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_lesson_step",
                        columnNames = "learning_step_id"
                )
        }, indexes = {
        @Index(
                name = "idx_lesson_step",
                columnList = "learning_step_id"
        )
})
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class LessonEntity {
    @Id
    @GeneratedValue
    private UUID id;

    @Version
    private Long version;

    @Column(columnDefinition = "TEXT")
    private String content;

    @OneToOne
    @JoinColumn(name = "learning_step_id")
    private LearningStepEntity learningStepEntity;

    // --- MUX VIDEO FIELDS ---
    // Saved during the initial Angular saveStep()
    private String videoUploadId;

    // Filled later by the Spring Boot Webhook
    private String videoPlaybackId;

    // Helps the UI show "Processing..." vs "Ready"
    private String videoStatus;

    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

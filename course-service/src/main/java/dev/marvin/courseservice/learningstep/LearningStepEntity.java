package dev.marvin.courseservice.learningstep;


import dev.marvin.courseservice.common.Status;
import dev.marvin.courseservice.module.ModuleEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "learning_steps",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_module_sequence",
                        columnNames = {"module_id", "sequence"}
                )
        }, indexes = {
        @Index(
                name = "idx_module_sequence",
                columnList = "module_id,sequence"
        )
})
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class LearningStepEntity {
    @Id
    @GeneratedValue
    private UUID id;

    @Version
    private Long version;

    private String title;
    private Integer sequence;

    @ManyToOne
    @JoinColumn(name = "module_id")
    private ModuleEntity module;

    @Enumerated(EnumType.STRING)
    private LearningStepType type;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.DRAFT;

    private boolean videoEnabled;
    private boolean contentEnabled;
    private boolean materialsEnabled;

    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

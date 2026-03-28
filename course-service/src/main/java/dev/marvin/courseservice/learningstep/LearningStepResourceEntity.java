package dev.marvin.courseservice.learningstep;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "learning_step_resources")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class LearningStepResourceEntity {
    @Id
    @GeneratedValue
    private UUID id;

    @Version
    private Long version;

    private String name;
    private String objectKey;
    private String contentType;
    private Long size;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "learning_step_id")
    private LearningStepEntity learningStepEntity;
}
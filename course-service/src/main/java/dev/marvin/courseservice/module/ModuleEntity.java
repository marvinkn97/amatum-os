package dev.marvin.courseservice.module;

import dev.marvin.courseservice.common.Status;
import dev.marvin.courseservice.course.CourseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "modules")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class ModuleEntity {
    @Id
    @GeneratedValue
    private UUID id;

    @Version
    private Long version;

    private Integer sequence;
    private String title;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.DRAFT;

    @ManyToOne
    @JoinColumn(name = "course_id")
    private CourseEntity course;

    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

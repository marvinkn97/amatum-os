package dev.marvin.ratingservice.rating;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "ratings",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_ratings_enrollment_id",
                        columnNames = {"enrollmentId"})
        })
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class RatingEntity {
    @Id
    @GeneratedValue
    private UUID id;

    @Version
    private Long version;

    private UUID enrollmentId;
    private UUID courseId;

    @Min(1)
    @Max(5)
    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

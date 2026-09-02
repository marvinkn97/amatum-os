package dev.marvin.identityservice.organisation;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "organizations")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class OrganizationEntity {
    @Id
    private UUID id;
    private String name;
    private String slug;
    @Column(columnDefinition = "TEXT")
    private String description;
    private String website;
    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

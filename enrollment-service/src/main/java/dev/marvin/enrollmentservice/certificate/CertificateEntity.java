package dev.marvin.enrollmentservice.certificate;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "certificates")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class CertificateEntity {
    @Id
    @GeneratedValue
    private UUID id;

    @Version
    private Long version;

    private String title;

    private UUID enrollmentId;
    private UUID learnerId;
    private String certificateUrl;
    private UUID serialNumber;
    private LocalDateTime issuedAt;
    private String tenantId;

    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

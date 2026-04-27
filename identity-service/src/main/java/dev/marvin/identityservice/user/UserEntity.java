package dev.marvin.identityservice.user;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class UserEntity {
    @Id
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private boolean amatumOnboarded;
    @CreationTimestamp
    private  LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

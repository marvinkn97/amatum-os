package dev.marvin.enrollmentservice.moduleprogress;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ModuleProgressRepository extends JpaRepository<ModuleProgressEntity, UUID> {
}

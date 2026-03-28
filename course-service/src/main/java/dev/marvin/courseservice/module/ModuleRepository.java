package dev.marvin.courseservice.module;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ModuleRepository extends JpaRepository<ModuleEntity, UUID> {

    List<ModuleEntity> findByCourse_IdOrderBySequenceAsc(UUID courseId);
}

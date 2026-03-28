package dev.marvin.courseservice.lesson;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LessonRepository extends JpaRepository<LessonEntity, UUID> {
    Optional<LessonEntity> findByVideoUploadId(String videoUploadId);

}

package dev.marvin.courseservice.module;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ModuleRepository extends JpaRepository<ModuleEntity, UUID> {

    List<ModuleEntity> findByCourse_IdOrderBySequenceAsc(UUID courseId);

    List<ModuleEntity> findByCourse_Id(UUID courseId);

    @Query("SELECT m.course.id, COUNT(m) FROM ModuleEntity m WHERE m.course.id IN :courseIds GROUP BY m.course.id")
    List<Object[]> countModulesByCourseIds(@Param("courseIds") List<UUID> courseIds);
}

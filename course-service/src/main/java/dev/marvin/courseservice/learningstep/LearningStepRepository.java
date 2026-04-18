package dev.marvin.courseservice.learningstep;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LearningStepRepository extends JpaRepository<LearningStepEntity, UUID> {
    List<LearningStepEntity> findByModule_IdIn(List<UUID> moduleIds);

    List<LearningStepEntity> findByModule_Id(UUID moduleId);

    int countAllByModule_Id(UUID moduleId);

    @Query("SELECT s.module.course.id, COUNT(s) FROM LearningStepEntity s WHERE s.module.course.id IN :courseIds GROUP BY s.module.course.id")
    List<Object[]> countStepsByCourseIds(@Param("courseIds") List<UUID> courseIds);
}

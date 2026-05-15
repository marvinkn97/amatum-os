package dev.marvin.ratingservice.rating;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RatingRepository extends JpaRepository<RatingEntity, UUID> {
    boolean existsByEnrollmentId(UUID enrollmentId);

    @Query("""
           SELECT r.courseId, AVG(r.rating)
           FROM RatingEntity r
           WHERE r.courseId IN :courseIds
           GROUP BY r.courseId
           """)
    List<Object[]> getRawAverageRatingsForCourses(List<UUID> courseIds);

}

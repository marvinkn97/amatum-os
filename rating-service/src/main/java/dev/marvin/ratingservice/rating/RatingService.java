package dev.marvin.ratingservice.rating;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RatingService {
    private final RatingRepository ratingRepository;
    private final RatingProducer ratingProducer;

    @Transactional
    public void submitRating(RatingRequest request) {
        log.info("Received rating request: {}", request);
        UUID enrollmentId = request.enrollmentId();

        if (ratingRepository.existsByEnrollmentId(enrollmentId)) {
            log.info("Rating for enrollment {} already exists", enrollmentId);
            return;
        }

        RatingEntity rating = RatingEntity.builder()
                .enrollmentId(enrollmentId)
                .courseId(request.courseId())
                .rating(request.rating())
                .comment(request.comment())
                .build();

        ratingRepository.saveAndFlush(rating);
        ratingProducer.sendEvent(enrollmentId);
    }

    @Transactional(readOnly = true)
    public Map<UUID, Double> getBulkAverageRatings(List<UUID> courseIds) {
        List<Object[]> results = ratingRepository.getRawAverageRatingsForCourses(courseIds);

        Map<UUID, Double> map = new HashMap<>();

        for (Object[] row : results) {
            UUID id = (UUID) row[0];
            // Note: AVG in Postgres usually returns a Double or BigDecimal
            Double avg = (row[1] != null) ? ((Number) row[1]).doubleValue() : 0.0;
            map.put(id, avg);
        }

        // Ensure courses with zero ratings are included
        courseIds.forEach(id -> map.putIfAbsent(id, 0.0));

        return map;
    }


}

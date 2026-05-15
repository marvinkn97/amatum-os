package dev.marvin.ratingservice.rating;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import rating.events.RatingEvent;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RatingProducer {
    private final KafkaTemplate<String, byte[]> kafkaTemplate;

    public void sendEvent(UUID enrollmentId) {
        log.info("Sending rating event for enrollmentId: {}", enrollmentId);
        try {
            RatingEvent event = RatingEvent.newBuilder()
                    .setEnrollmentId(enrollmentId.toString())
                    .setEventType("RATING_CREATED")
                    .build();

            kafkaTemplate.send("rating-topic", enrollmentId.toString(), event.toByteArray());

            log.info("Rating event sent for enrollmentId: {}", enrollmentId);

        } catch (Exception e) {
            log.error("Error sending rating event", e);
        }
    }
}
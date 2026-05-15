package dev.marvin.enrollmentservice.kafka;

import com.google.protobuf.InvalidProtocolBufferException;
import dev.marvin.enrollmentservice.enrollment.EnrollmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import rating.events.RatingEvent;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaConsumer {
    private final EnrollmentService enrollmentService;

    @KafkaListener(
            topics = "rating-topic",
            groupId = "enrollment-service-consumer",
            autoStartup = "true",
            concurrency = "1"
    )
    public void consumeEvent(byte[] event) {
        log.info("Received rating event: {}", event);
        try {
            RatingEvent ratingEvent = RatingEvent.parseFrom(event);

            UUID enrollmentId = UUID.fromString(ratingEvent.getEnrollmentId());
            enrollmentService.markEnrollmentAsRated(enrollmentId);

        } catch (InvalidProtocolBufferException e) {
            log.error("Error parsing rating event", e);
        } catch (Exception e) {
            log.error("Error processing enrollment update for event", e);
            throw e; // Throwing allows Spring Kafka to retry transient DB issues
        }
    }
}

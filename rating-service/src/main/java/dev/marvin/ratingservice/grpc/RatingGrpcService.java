package dev.marvin.ratingservice.grpc;

import dev.marvin.rating.proto.BulkRatingRequest;
import dev.marvin.rating.proto.BulkRatingResponse;
import dev.marvin.rating.proto.CourseRating;
import dev.marvin.rating.proto.RatingServiceGrpc;
import dev.marvin.ratingservice.rating.RatingService;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.grpc.server.service.GrpcService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@GrpcService
@RequiredArgsConstructor
@Slf4j
public class RatingGrpcService extends RatingServiceGrpc.RatingServiceImplBase {
    private final RatingService ratingService;

    @Override
    public void getBulkAverageRatings(BulkRatingRequest request, StreamObserver<BulkRatingResponse> responseObserver) {
        log.info("Received bulk rating request: {}", request);

        try {
            List<UUID> courseIds = request.getCourseIdsList().stream()
                    .map(UUID::fromString)
                    .toList();


            Map<UUID, Double> ratingsMap = ratingService.getBulkAverageRatings(courseIds);

            List<CourseRating> protoRatings = ratingsMap.entrySet().stream()
                    .map(entry -> CourseRating.newBuilder()
                            .setCourseId(entry.getKey().toString())
                            .setAverageRating(entry.getValue())
                            .build())
                    .toList();


            BulkRatingResponse response = BulkRatingResponse.newBuilder()
                    .addAllRatings(protoRatings)
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();

        } catch (Exception e) {
            log.error("Error processing bulk rating request", e);
            responseObserver.onError(
                    io.grpc.Status.INTERNAL
                            .withDescription("Failed to process bulk ratings")
                            .withCause(e)
                            .asRuntimeException()
            );
        }


    }
}

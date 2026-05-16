package dev.marvin.courseservice.grpc;

import dev.marvin.rating.proto.CourseRating;
import dev.marvin.rating.proto.RatingServiceGrpc;
import io.grpc.ClientInterceptor;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import io.grpc.Metadata;
import io.grpc.stub.MetadataUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class RatingServiceGrpcClient {
    private final RatingServiceGrpc.RatingServiceBlockingStub blockingStub;

    public RatingServiceGrpcClient(
            @Value("${spring.grpc.client.rating-service.address}") String serverAddress,
            @Value("${spring.grpc.client.rating-service.port}") int serverPort
    ) {
        log.info("Connecting to rating service grpc server at {}:{}", serverAddress, serverPort);
        ManagedChannel channel = ManagedChannelBuilder.forAddress(serverAddress, serverPort)
                .usePlaintext()
                .build();

        blockingStub = RatingServiceGrpc.newBlockingStub(channel);
    }

    private RatingServiceGrpc.RatingServiceBlockingStub authenticatedStub() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assert auth != null;
        Jwt jwt = (Jwt) auth.getPrincipal();
        assert jwt != null;
        String token = jwt.getTokenValue();

        Metadata metadata = new Metadata();

        Metadata.Key<String> authorization =
                Metadata.Key.of("Authorization", Metadata.ASCII_STRING_MARSHALLER);

        metadata.put(authorization, "Bearer " + token);

        ClientInterceptor interceptor =
                MetadataUtils.newAttachHeadersInterceptor(metadata);

        return blockingStub.withInterceptors(interceptor);
    }

    public List<CourseRating> getBulkAverageRatings(List<UUID> courseIds) {
        try {
            if (courseIds == null || courseIds.isEmpty()) {
                return List.of();
            }

            List<String> protoCourseIds = courseIds.stream()
                    .map(UUID::toString)
                    .toList();

            dev.marvin.rating.proto.BulkRatingRequest request = dev.marvin.rating.proto.BulkRatingRequest.newBuilder()
                    .addAllCourseIds(protoCourseIds)
                    .build();

            dev.marvin.rating.proto.BulkRatingResponse response = authenticatedStub()
                    .getBulkAverageRatings(request);

            return response.getRatingsList();

        } catch (Exception e) {
            log.error(e.getMessage());
            throw e;
        }
    }

}

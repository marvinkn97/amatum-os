package dev.marvin.courseservice.grpc;

import enrollment.proto.*;
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
public class EnrollmentServiceGrpcClient {
    private final EnrollmentServiceGrpc.EnrollmentServiceBlockingStub blockingStub;

    public EnrollmentServiceGrpcClient(
            @Value("${spring.grpc.client.enrollment-service.address}") String serverAddress,
            @Value("${spring.grpc.client.enrollment-service.port}") int serverPort
    ) {
        log.info("Connecting to enrollment grpc server at {}:{}", serverAddress, serverPort);
        ManagedChannel channel = ManagedChannelBuilder.forAddress(serverAddress, serverPort)
                .usePlaintext()
                .build();

        blockingStub = EnrollmentServiceGrpc.newBlockingStub(channel);
    }

    private EnrollmentServiceGrpc.EnrollmentServiceBlockingStub authenticatedStub() {

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

    public EnrollmentCheckResponse getEnrollmentCheckResponse(String courseId, String learnerId) {
        try {
            EnrollmentCheckRequest enrollmentCheckRequest = EnrollmentCheckRequest.newBuilder()
                    .setCourseId(courseId)
                    .setLearnerId(learnerId)
                    .build();

            EnrollmentCheckResponse enrollmentCheckResponse = authenticatedStub().checkEnrollmentStatus(enrollmentCheckRequest);
            log.info("Received enrollment check response: {}", enrollmentCheckResponse);
            return enrollmentCheckResponse;

        } catch (Exception e) {
            log.error(e.getMessage());
            throw e;
        }
    }

    public BulkEnrollmentCheckResponse getBulkEnrollmentCheckResponse(List<UUID> courseIds, String learnerId) {
        try {
            BulkEnrollmentCheckRequest bulkEnrollmentCheckRequest = BulkEnrollmentCheckRequest.newBuilder()
                    .addAllCourseIds(courseIds.stream().map(UUID::toString).toList())
                    .setLearnerId(learnerId)
                    .build();

            BulkEnrollmentCheckResponse bulkEnrollmentCheckResponse = authenticatedStub().checkEnrollmentStatuses(bulkEnrollmentCheckRequest);
            log.info("Received Bulk enrollment check response: {}", bulkEnrollmentCheckResponse);
            return bulkEnrollmentCheckResponse;

        } catch (Exception e) {
            log.error(e.getMessage());
            throw e;
        }
    }
}

package dev.marvin.enrollmentservice.grpc;

import dev.marvin.identity.proto.*;
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

@Service
@Slf4j
public class IdentityServiceGrpcClient {
    private final IdentityServiceGrpc.IdentityServiceBlockingStub blockingStub;

    public IdentityServiceGrpcClient(
            @Value("${spring.grpc.client.identity-service.address}") String serverAddress,
            @Value("${spring.grpc.client.identity-service.port}") int serverPort
    ){
        log.info("Connecting to identity service grpc server at {}:{}", serverAddress, serverPort);
        ManagedChannel channel = ManagedChannelBuilder.forAddress(serverAddress, serverPort)
                .usePlaintext()
                .build();

        blockingStub = IdentityServiceGrpc.newBlockingStub(channel);
    }

    private IdentityServiceGrpc.IdentityServiceBlockingStub authenticatedStub() {
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

        return blockingStub
                .withInterceptors(interceptor)
                .withDeadlineAfter(5, java.util.concurrent.TimeUnit.SECONDS);
    }

    public UserResponse getUserProfile(String userId) {
        log.info("Fetching user profile for userId: {}", userId);
        try {
            UserRequest request = UserRequest.newBuilder()
                    .setUserId(userId)
                    .build();
            return authenticatedStub().getUserById(request);
        } catch (Exception e) {
            log.error("Error fetching user profile for userId: {}", userId, e);
            throw e;
        }
    }

    public OrgResponse getOrganizationDetails(String organizationId) {
        log.info("Fetching organization details for organizationId: {}", organizationId);
        try {
            OrgRequest request = OrgRequest.newBuilder()
                    .setOrgId(organizationId)
                    .build();
            return authenticatedStub().getOrganizationById(request);
        } catch (Exception e) {
            log.error("Error fetching organization details for organizationId: {}", organizationId, e);
            throw e;
        }

    }
}

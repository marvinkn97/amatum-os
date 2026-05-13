package dev.marvin.identityservice.grpc;

import dev.marvin.identity.proto.OrgRequest;
import dev.marvin.identity.proto.OrgResponse;
import dev.marvin.identity.proto.UserRequest;
import dev.marvin.identity.proto.UserResponse;
import dev.marvin.identityservice.IdentityService;
import dev.marvin.identityservice.organisation.OrganizationService;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.grpc.server.service.GrpcService;

import static dev.marvin.identity.proto.IdentityServiceGrpc.IdentityServiceImplBase;

@GrpcService
@RequiredArgsConstructor
@Slf4j
public class IdentityGrpcService extends IdentityServiceImplBase {
    private final IdentityService identityService;
    private final OrganizationService organizationService;

    @Override
    public void getUserById(UserRequest request, StreamObserver<UserResponse> responseObserver) {
        try {
            log.info("gRPC: Fetching user details for ID: {}", request.getUserId());

            var user = identityService.getGrpcUser(request.getUserId());

            UserResponse response = UserResponse.newBuilder()
                    .setUserId(user.id().toString())
                    .setFirstName(user.firstName())
                    .setLastName(user.lastName())
                    .setEmail(user.email())
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("Error fetching user details", e);
            responseObserver.onError(e);
        }
    }

    @Override
    public void getOrganizationById(OrgRequest request, StreamObserver<OrgResponse> responseObserver) {
        try {
            log.info("gRPC: Fetching organization details for ID: {}", request.getOrgId());

            // 1. Fetch from your OrganizationService (which calls Keycloak)
            var org = organizationService.getOrganization(request.getOrgId());

            // 2. Build Proto Response
            OrgResponse response = OrgResponse.newBuilder()
                    .setName(org.name())
                    .setSlug(org.slug())
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception e) {
           log.error("Error fetching organization details", e);
           responseObserver.onError(e);
        }
    }
}

package dev.marvin.identityservice.organisation;

import dev.marvin.identityservice.exception.BadRequestException;
import dev.marvin.identityservice.keycloak.KeycloakService;
import dev.marvin.identityservice.security.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.representations.idm.OrganizationRepresentation;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrganizationService {
    private final KeycloakService keycloakService;

    public OrganizationResponse getOrganization(String orgId) {
        log.info("Request to get organization details for ID: {}", orgId);

        OrganizationRepresentation representation = keycloakService.getOrganizationById(orgId);

        // Note: Keycloak uses 'Alias' for what we call 'Slug'
        return new OrganizationResponse(
                UUID.fromString(representation.getId()),
                representation.getName(),
                representation.getAlias()
        );
    }

    public List<OrganizationInvitationResponse> getOrganizationInvitations() {
        if (!TenantContext.TENANT_ID.isBound()) {
            throw new BadRequestException("No active organization context found in request");
        }

        String activeTenantId = TenantContext.TENANT_ID.get();

        log.info("Fetching invitations for org {}", activeTenantId);

        return keycloakService.getOrganizationInvitations(activeTenantId)
                .stream()
                .map(invitationRepresentation -> new OrganizationInvitationResponse(
                        invitationRepresentation.getId(),
                        invitationRepresentation.getEmail(),
                        invitationRepresentation.getFirstName(),
                        invitationRepresentation.getLastName(),
                        invitationRepresentation.getStatus().toString()
                ))
                .toList();
    }

    public void inviteMember(OrganizationInvitationRequest request) {
        if (!TenantContext.TENANT_ID.isBound()) {
            throw new BadRequestException("No active organization context found in request");
        }

        String activeTenantId = TenantContext.TENANT_ID.get();

        log.info("Inviting user {} to org {}", request.email(), activeTenantId);
        keycloakService.inviteMember(activeTenantId, request);
    }

}

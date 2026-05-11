package dev.marvin.identityservice.organisation;

import dev.marvin.identityservice.keycloak.KeycloakService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.representations.idm.OrganizationRepresentation;
import org.springframework.stereotype.Service;

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
}

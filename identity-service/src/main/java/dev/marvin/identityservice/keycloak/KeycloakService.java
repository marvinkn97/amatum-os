package dev.marvin.identityservice.keycloak;

import dev.marvin.identityservice.exception.ServiceException;
import dev.marvin.identityservice.organisation.OrganizationRequest;
import dev.marvin.identityservice.user.NameUpdateRequest;
import dev.marvin.identityservice.user.PasswordUpdateRequest;
import dev.marvin.identityservice.user.UserRole;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.representations.idm.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.util.HashMap;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class KeycloakService {
    private final Keycloak keycloak;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.groups.learner-id}")
    private String learnerGroupId;

    @Value("${keycloak.groups.manager-id}")
    private String managerGroupId;

    public void updateUserAttribute(String userId, String key, String value) {
        var userResource = keycloak.realm(realm).users().get(userId);
        var userRep = userResource.toRepresentation();

        if (userRep.getAttributes() == null) {
            userRep.setAttributes(new HashMap<>());
        }

        userRep.getAttributes().put(key, List.of(value));
        userResource.update(userRep);
    }

    public boolean addClientRoleToUser(String userId, UserRole role) {
        try {
            if (role.equals(UserRole.LEARNER)) {
                keycloak.realm(realm)
                        .users()
                        .get(userId)
                        .joinGroup(learnerGroupId);
            }

            if (role.equals(UserRole.MANAGER)) {
                keycloak.realm(realm)
                        .users()
                        .get(userId)
                        .joinGroup(managerGroupId);
            }

            return true;

        } catch (Exception e) {
            log.error("Failed to assign role {} to user {}", role, userId, e);
            return false;
        }
    }

    public boolean addOrganizationWithMember(String userId, OrganizationRequest organizationRequest) {
        try {
            OrganizationRepresentation orgRep = new OrganizationRepresentation();
            orgRep.setName(organizationRequest.name());
            orgRep.setAlias(organizationRequest.slug());

            OrganizationDomainRepresentation domain = new OrganizationDomainRepresentation();
            domain.setName(organizationRequest.domain());
            domain.setVerified(false);
            orgRep.addDomain(domain);

            try (Response response = keycloak.realm(realm)
                    .organizations()
                    .create(orgRep)) {

                if (response.getStatus() != Response.Status.CREATED.getStatusCode()) {
                    log.error("Failed to create organization: {}", response.getStatusInfo());
                    return false;
                }

                URI location = response.getLocation();
                if (location == null) {
                    log.error("Missing Location header in organization creation response");
                    return false;
                }
                String path = location.getPath();
                String orgId = path.substring(path.lastIndexOf('/') + 1);
                log.info("Organization created with id: {}", orgId);

                try (Response memberResponse = keycloak.realm(realm)
                        .organizations()
                        .get(orgId)
                        .members()
                        .addMember(userId)) {

                    if (memberResponse.getStatus() != Response.Status.CREATED.getStatusCode()) {
                        log.error("Failed to add member: {}", memberResponse.getStatusInfo());
                        return false;
                    }

                    log.info("Member {} successfully assigned to organization {}", userId, orgId);
                }

                return true;
            }

        } catch (Exception e) {
            log.error("Failed to add organization with member", e);
            return false;
        }
    }

    public UserRepresentation updateUserName(String userId, NameUpdateRequest nameUpdateRequest) {
        try {
            log.info("Fetching user {} from Keycloak realm {}", userId, realm);
            var userResource = keycloak.realm(realm).users().get(userId);
            UserRepresentation userRepresentation = userResource.toRepresentation();

            boolean changes = false;

            if (!userRepresentation.getFirstName().equals(nameUpdateRequest.firstName())) {
                userRepresentation.setFirstName(nameUpdateRequest.firstName());
                changes = true;
            }

            if (!userRepresentation.getLastName().equals(nameUpdateRequest.lastName())) {
                userRepresentation.setLastName(nameUpdateRequest.lastName());
                changes = true;
            }

            if (!changes) {
                log.info("No changes to user {} in realm {}", userId, realm);
                return userRepresentation;
            }

            userResource.update(userRepresentation);
            log.info("Keycloak successfully updated name for user {}", userId);

            return userRepresentation;
        } catch (Exception e) {
            log.error("Keycloak failed to update name for user {}: {}", userId, e.getMessage(), e);
            throw new ServiceException(e.getMessage()); // rethrow if you want upstream handling
        }
    }

    public void resetPassword(String userId, PasswordUpdateRequest passwordUpdateRequest) {
        try {
            log.info("Resetting password for user {} in realm {}", userId, realm);
            CredentialRepresentation credential = new CredentialRepresentation();
            credential.setTemporary(false);
            credential.setType(CredentialRepresentation.PASSWORD);
            credential.setValue(passwordUpdateRequest.password());

            var userResource = keycloak.realm(realm).users().get(userId);

            userResource.resetPassword(credential);
            log.info("Keycloak successfully reset password for user {}", userId);

            log.info("Forcing re-login after password change");
            userResource.logout();
        } catch (Exception e) {
            log.error("Keycloak failed to reset password for user {}: {}", userId, e.getMessage(), e);
            throw new ServiceException(e.getMessage());
        }
    }
}

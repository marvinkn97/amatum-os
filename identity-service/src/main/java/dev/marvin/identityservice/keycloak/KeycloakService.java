package dev.marvin.identityservice.keycloak;

import dev.marvin.identityservice.exception.ServiceException;
import dev.marvin.identityservice.organisation.OrganizationInvitationRequest;
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
import java.util.Collections;
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

                // Create the default Managers group
                String managersGroupId = createManagersGroup(orgId);

                if (managersGroupId.isBlank()) {
                    log.error("Failed to create Managers group for organization {}", orgId);
                    return false;
                }

                // Add the creator to the Managers group
                addMemberToOrganizationGroup(orgId, managersGroupId, userId);

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
            throw e; // rethrow if you want upstream handling
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
            throw e;
        }
    }

    public OrganizationRepresentation getOrganizationById(String orgId) {
        try {
            if (orgId == null) {
                return null;
            }

            log.info("Fetching organization {} from realm {}", orgId, realm);

            OrganizationRepresentation orgRep = keycloak.realm(realm)
                    .organizations()
                    .get(orgId)
                    .toRepresentation();

            if (orgRep == null) {
                log.warn("Organization {} not found in realm {}", orgId, realm);
            }

            return orgRep;
        } catch (Exception e) {
            log.error("Failed to fetch organization {}: {}", orgId, e.getMessage());
            throw e;
        }
    }

    public List<MemberRepresentation> getOrganizationMembers(String orgId) {
        try {
            if (orgId == null) {
                return Collections.emptyList();
            }
            log.info("Fetching members of organization {} from realm {}", orgId, realm);
            return keycloak.realm(realm)
                    .organizations()
                    .get(orgId)
                    .members()
                    .list(0, Integer.MAX_VALUE);

        } catch (Exception e) {
            log.error("Failed to fetch members of organization {}: {}", orgId, e.getMessage());
            throw e;
        }
    }

    public void inviteMember(String orgId, OrganizationInvitationRequest invitationRequest) {
        try {
            String email = invitationRequest.email();

            log.info("Inviting member with email {} to organization {} in realm {}",
                    email, orgId, realm);

            try (Response response = keycloak.realm(realm)
                    .organizations()
                    .get(orgId)
                    .members()
                    .inviteUser(
                            email,
                            invitationRequest.firstName(),
                            invitationRequest.lastName()
                    )) {

                if (response.getStatus() != Response.Status.NO_CONTENT.getStatusCode()
                        && response.getStatus() != Response.Status.CREATED.getStatusCode()) {

                    log.error("Failed to invite member: {}", response.getStatusInfo());
                }

                log.info("Successfully invited member with email {} to organization {}", email, orgId);
            }

        } catch (Exception e) {
            log.error("Failed to invite member with email {}: {}", invitationRequest.email(), e.getMessage(), e);
            throw e;
        }
    }


    public List<OrganizationInvitationRepresentation> getOrganizationInvitations(String orgId) {
        try {
            log.info("Fetching invitations for organization {} in realm {}", orgId, realm);

            List<OrganizationInvitationRepresentation> invitations =
                    keycloak.realm(realm)
                            .organizations()
                            .get(orgId)
                            .invitations()
                            .list();

            log.info("Found {} invitations for organization {}", invitations.size(), orgId);

            return invitations;

        } catch (Exception e) {
            log.error("Failed to fetch invitations for organization {}: {}", orgId, e.getMessage(), e);
            throw e;
        }
    }

    private String createManagersGroup(String organizationId) {
        try {
            GroupRepresentation group = new GroupRepresentation();
            group.setName("Managers");

            try (Response response = keycloak.realm(realm)
                    .organizations()
                    .get(organizationId)
                    .groups()
                    .addTopLevelGroup(group)) {

                if (response.getStatus() != Response.Status.CREATED.getStatusCode()) {
                    log.error("Failed to create Managers group: {}", response.getStatusInfo());
                    throw new ServiceException("");
                }

                URI location = response.getLocation();
                if (location == null) {
                    log.error("Missing Location header");
                }

                assert location != null;
                return location.getPath()
                        .substring(location.getPath()
                                .lastIndexOf('/') + 1);
            }
        } catch (Exception e) {
            log.error("Failed to create Managers group for organization {}", organizationId, e);
            throw e;
        }
    }

    private void addMemberToOrganizationGroup(String organizationId, String groupId, String userId) {
        try {
            keycloak.realm(realm)
                    .organizations()
                    .get(organizationId)
                    .groups()
                    .group(groupId)
                    .addMember(userId);
        } catch (Exception e) {
            log.error("Failed to add user {} to Managers group {} in organization {}", userId, groupId, organizationId, e);
            throw e;
        }
    }
}

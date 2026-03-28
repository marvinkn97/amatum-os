package dev.marvin.identityservice;

import dev.marvin.identityservice.exception.ResourceNotFoundException;
import dev.marvin.identityservice.exception.ServiceException;
import dev.marvin.identityservice.keycloak.KeycloakService;
import dev.marvin.identityservice.organisation.OrganizationRequest;
import dev.marvin.identityservice.user.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class IdentityService {
    private final UserRepository userRepository;
    private final KeycloakService keycloakService;


    public void onboardLearner(Authentication authentication) {
        // Only process if it's a JWT token
        if (!(authentication instanceof JwtAuthenticationToken jwtAuthenticationToken)) {
            log.info("Authentication is not a JWT token, skipping learner onboarding");
            return; // skip processing instead of throwing
        }

        var tokenAttributes = jwtAuthenticationToken.getTokenAttributes();

        String userId = (String) tokenAttributes.get("sub");
        String email = (String) tokenAttributes.get("email");
        String firstName = (String) tokenAttributes.get("given_name");
        String lastName = (String) tokenAttributes.get("family_name");

        Optional<UserEntity> userOpt = userRepository.findById(UUID.fromString(userId));

        if (userOpt.isPresent()) {
            UserEntity user = userOpt.get();

            // If already onboarded to the platform, we just check roles
            if (user.isAmatumOnboarded()) {
                log.info("User {} is already a platform member. Ensuring LEARNER role is active.", userId);

                boolean roleAdded = keycloakService.addClientRoleToUser(userId, UserRole.LEARNER);
                if (!roleAdded) {
                    log.error("Failed to add LEARNER role to existing user {}", userId);
                    throw new ServiceException("Onboarding failed: could not activate Learning Hub for your account.");
                }

                log.info("LEARNER role successfully added to existing platform user.");
                return; // Success! No need to proceed to "First Time" logic.
            }

        }

        // FIRST-TIME ONBOARDING (User is totally new to Amatum)
        log.info("Initiating first-time platform onboarding for: {}", tokenAttributes.get("email"));

        boolean roleAssigned = keycloakService.addClientRoleToUser(userId, UserRole.LEARNER);
        if (!roleAssigned) {
            log.error("Failed to assign ROLE_LEARNER to user {}", userId);
            throw new ServiceException("Onboarding failed: could not activate Learning Hub for your account.");
        }

        log.info("LEARNER role successfully added to new platform user.");

        keycloakService.updateUserAttribute(userId, "amatum_onboarded", "true");

        // Save user in identity DB
        UserEntity user = UserEntity.builder()
                .id(UUID.fromString(userId))
                .email(email)
                .firstName(firstName)
                .lastName(lastName)
                .amatumOnboarded(true)
                .build();
        try {
            userRepository.save(user);
            log.info("User {} successfully onboarded to Amatum platform.", userId);

        } catch (Exception e) {
            log.error("Failed to persist user {}, will be reconciled by Keycloak sync", userId, e);
        }

    }

    public void onBoardManager(Authentication authentication, OrganizationRequest organizationRequest) {
        // Only process if it's a JWT token
        if (!(authentication instanceof JwtAuthenticationToken jwtAuthenticationToken)) {
            log.warn("Authentication is not a JWT token, skipping manager onboarding");
            return; // skip processing instead of throwing
        }

        var tokenAttributes = jwtAuthenticationToken.getTokenAttributes();

        String userId = (String) tokenAttributes.get("sub");
        String email = (String) tokenAttributes.get("email");
        String firstName = (String) tokenAttributes.get("given_name");
        String lastName = (String) tokenAttributes.get("family_name");

        Optional<UserEntity> userOpt = userRepository.findById(UUID.fromString(userId));

        if (userOpt.isPresent()) {
            UserEntity user = userOpt.get();

            // If already onboarded to the platform, we just check roles
            if (user.isAmatumOnboarded()) {
                log.info("User {} is already a platform member. Ensuring MANAGER role is active.", userId);

                boolean roleAdded = keycloakService.addClientRoleToUser(userId, UserRole.MANAGER);
                if (!roleAdded) {
                    log.error("Failed to add MANAGER role to existing user {}", userId);
                    throw new ServiceException("Onboarding failed: could not activate Manager Hub for your account.");
                }


                boolean addedOrganizationToRealm = keycloakService.addOrganizationWithMember(userId, organizationRequest);
                if (!addedOrganizationToRealm) {
                    log.error("Failed to add organization {} to Keycloak realm", organizationRequest.name());
                    throw new ServiceException("Onboarding failed: could not add organization");
                }

                return; // Success! No need to proceed to "First Time" logic.
            }

        }

        boolean roleAssigned = keycloakService.addClientRoleToUser(userId, UserRole.MANAGER);
        if (!roleAssigned) {
            log.error("Failed to assign ROLE_MANAGER to user {}", userId);
            throw new ServiceException("Onboarding failed: could not activate Manager Hub for your account.");
        }

        boolean addedOrganizationToRealm = keycloakService.addOrganizationWithMember(userId, organizationRequest);
        if (!addedOrganizationToRealm) {
            log.error("Failed to add organization {} to Keycloak realm", organizationRequest.name());
            throw new ServiceException("Onboarding failed: could not add organization");
        }

        keycloakService.updateUserAttribute(userId, "amatum_onboarded", "true");

        // Save user in identity DB
        UserEntity user = UserEntity.builder()
                .id(UUID.fromString(userId))
                .email(email)
                .firstName(firstName)
                .lastName(lastName)
                .amatumOnboarded(true)
                .build();

        try {
            userRepository.save(user);
        } catch (Exception e) {
            log.error("Failed to persist user {}, will be reconciled by Keycloak sync", userId, e);
        }

    }

    public IdentityResponse getCurrentUser(Authentication authentication) {
        return userRepository.findById(UUID.fromString((authentication.getName())))
                .map(userEntity -> new IdentityResponse(userEntity.getId(), userEntity.getFirstName(), userEntity.getLastName(), userEntity.getEmail()))
                .orElseThrow(() -> new ResourceNotFoundException("User with id " + authentication.getName() + " not found"));
    }

    public void updateAuthenticatedUserName(Authentication authentication, NameUpdateRequest nameUpdateRequest) {
        String userId = authentication.getName();
        UserRepresentation userRepresentation = keycloakService.updateUserName(authentication.getName(), nameUpdateRequest);

        userRepository.findById(UUID.fromString(userId)).ifPresentOrElse(userEntity -> {
            log.info("Updating local DB user details");
            boolean changes = false;
            if (!userRepresentation.getFirstName().equals(userEntity.getFirstName())) {
                userEntity.setFirstName(userRepresentation.getFirstName());
                changes = true;
            }

            if (!userRepresentation.getLastName().equals(userEntity.getLastName())) {
                userEntity.setLastName(userRepresentation.getLastName());
                changes = true;
            }

            if (!changes) {
                log.info("No data changes found");
                return;
            }

            userRepository.save(userEntity);
        }, () -> {
            throw new ResourceNotFoundException("User with given id [%s] not found".formatted(UUID.fromString(userId)));
        });

    }

    public void updateAuthenticatedUserPassword(Authentication authentication, PasswordUpdateRequest passwordUpdateRequest) {
        String userId = authentication.getName();
        keycloakService.resetPassword(userId, passwordUpdateRequest);
        log.info("Password updated for user {}", userId);
    }

}

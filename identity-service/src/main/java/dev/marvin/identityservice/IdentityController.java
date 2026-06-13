package dev.marvin.identityservice;

import dev.marvin.identityservice.organisation.OrganizationInvitationRequest;
import dev.marvin.identityservice.organisation.OrganizationInvitationResponse;
import dev.marvin.identityservice.organisation.OrganizationRequest;
import dev.marvin.identityservice.organisation.OrganizationService;
import dev.marvin.identityservice.user.NameUpdateRequest;
import dev.marvin.identityservice.user.PasswordUpdateRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/identity")
@Slf4j
@Tag(name = "Identity Service", description = "Identity Service API")
public class IdentityController {
    private final IdentityService identityService;
    private final PagedResourcesAssembler<IdentityResponse> pagedResourcesAssembler;
    private final OrganizationService organizationService;

    @Operation(summary = "Onboard learner")
    @PostMapping("/onboard/learner")
    public ResponseEntity<Void> onboardLearner(@NonNull Authentication authentication) {
       log.info("Received onboard individual request");
        identityService.onboardLearner(authentication);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Onboard manager")
    @PostMapping("/onboard/manager")
    public ResponseEntity<Void> onboardManager(@NonNull Authentication authentication, @Valid @RequestBody OrganizationRequest organizationRequest) {
        log.info("Received onboard organization request");
        identityService.onBoardManager(authentication, organizationRequest);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Get current user")
    @GetMapping("/me")
    public ResponseEntity<IdentityResponse>  getCurrentUser(@NonNull Authentication authentication) {
        log.info("Received get current user request");
        IdentityResponse identityResponse = identityService.getCurrentUser(authentication);
        return ResponseEntity.ok(identityResponse);
    }

    @Operation(summary = "Update authenticated user name")
    @PatchMapping("/me/name")
    public ResponseEntity<Void> updateAuthenticatedUserName(@NonNull Authentication authentication, @Valid @RequestBody NameUpdateRequest nameUpdateRequest) {
        log.info("Received update user name request");
        identityService.updateAuthenticatedUserName(authentication, nameUpdateRequest);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Update authenticated user password")
    @PatchMapping("/me/password")
    public ResponseEntity<Void> updateAuthenticatedUserPassword(@NonNull Authentication authentication, @Valid @RequestBody PasswordUpdateRequest passwordUpdateRequest) {
        log.info("Received update user password request");
        identityService.updateAuthenticatedUserPassword(authentication, passwordUpdateRequest);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Get organization members")
    @GetMapping("/organization/members")
    public ResponseEntity<PagedModel<EntityModel<IdentityResponse>>> getOrganisationMembers(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @NonNull Authentication authentication
    ) {
        Page<IdentityResponse> identityResponsePage = identityService.getOrganizationMembers(PageRequest.of(page, size), authentication);

        PagedModel<EntityModel<IdentityResponse>> pagedModel =
                pagedResourcesAssembler.toModel(identityResponsePage, EntityModel::of);

        return ResponseEntity.ok(pagedModel);
    }

    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Get organization invitations")
    @GetMapping("/organization/invitations")
    public ResponseEntity<List<OrganizationInvitationResponse>> getOrganizationInvitations() {
        log.info("Received request to fetch organization invitations");
        List<OrganizationInvitationResponse> invitations = organizationService.getOrganizationInvitations();
        return ResponseEntity.ok(invitations);
    }

    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Invite member to organization")
    @PostMapping("/organization/invitations")
    public ResponseEntity<Void> inviteMember(@Valid @RequestBody OrganizationInvitationRequest request) {
        log.info("Received request to invite member {}", request.email());
        organizationService.inviteMember(request);
        return ResponseEntity.ok().build();
    }
    
}

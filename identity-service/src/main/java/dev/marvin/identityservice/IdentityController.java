package dev.marvin.identityservice;

import dev.marvin.identityservice.organisation.OrganizationRequest;
import dev.marvin.identityservice.user.NameUpdateRequest;
import dev.marvin.identityservice.user.PasswordUpdateRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/identity")
@Slf4j
@Tag(name = "Identity Service", description = "Identity Service API")
public class IdentityController {
    private final IdentityService identityService;

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
}

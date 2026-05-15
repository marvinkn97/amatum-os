package dev.marvin.enrollmentservice.certificate;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Certificates", description = "Certificates API")
public class CertificateController {
    private final CertificateService certificateService;
    private final PagedResourcesAssembler<CertificateResponse> pagedResourcesAssembler;

    @PreAuthorize("hasRole('LEARNER')")
    @Operation(summary = "Get certificates for the authenticated learner")
    @GetMapping("/me")
    public ResponseEntity<PagedModel<EntityModel<CertificateResponse>>> getActiveEnrollments(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @NonNull Authentication authentication
    ) {
        Page<CertificateResponse> certificateResponsePage =
                certificateService.getAll(authentication, PageRequest.of(page, size));

        return ResponseEntity.ok(pagedResourcesAssembler.toModel(certificateResponsePage, EntityModel::of));
    }

}

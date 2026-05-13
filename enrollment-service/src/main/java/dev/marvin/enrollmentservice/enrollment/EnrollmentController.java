package dev.marvin.enrollmentservice.enrollment;

import dev.marvin.enrollmentservice.certificate.CertificateResponse;
import dev.marvin.enrollmentservice.quizattempt.QuizAttemptRequest;
import dev.marvin.enrollmentservice.quizattempt.QuizAttemptResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Enrollments", description = "Enrollments API")
public class EnrollmentController {
    private final EnrollmentService enrollmentService;
    private final PagedResourcesAssembler<EnrollmentResponse> pagedResourcesAssembler;
    private final PagedResourcesAssembler<QuizAttemptResponse> attemptResponsePagedResourcesAssembler;


    @PreAuthorize("hasRole('LEARNER')")
    @Operation(summary = "Enroll a learner")
    @PostMapping
    public ResponseEntity<EnrollmentResponse> enroll(@Valid @RequestBody EnrollmentRequest enrollmentRequest, @NonNull Authentication authentication) {
        log.info("Received enrollment request {}", enrollmentRequest);
        EnrollmentResponse enrollmentResponse = enrollmentService.enroll(enrollmentRequest, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(enrollmentResponse);
    }

    @PreAuthorize("hasRole('LEARNER')")
    @Operation(summary = "Get active enrollments for the authenticated learner")
    @GetMapping("/active")
    public ResponseEntity<PagedModel<EntityModel<EnrollmentResponse>>> getActiveEnrollments(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @NonNull Authentication authentication
    ) {
        Page<EnrollmentResponse> enrollmentResponsePage =
                enrollmentService.getActiveEnrollmentsByLearnerIdAndTenantId(authentication, PageRequest.of(page, size));

        return ResponseEntity.ok(pagedResourcesAssembler.toModel(enrollmentResponsePage, EntityModel::of));
    }

    @PreAuthorize("hasRole('LEARNER')")
    @Operation(summary = "Get completed enrollments for the authenticated learner")
    @GetMapping("/completed")
    public ResponseEntity<PagedModel<EntityModel<EnrollmentResponse>>> getCompletedEnrollments(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @NonNull Authentication authentication
    ) {
        Page<EnrollmentResponse> enrollmentResponsePage =
                enrollmentService.getCompletedEnrollmentsByLearnerId(authentication, PageRequest.of(page, size));

        return ResponseEntity.ok(pagedResourcesAssembler.toModel(enrollmentResponsePage, EntityModel::of));
    }

    @PreAuthorize("hasRole('LEARNER')")
    @Operation(summary = "Get a enrollment by ID")
    @GetMapping("/{id}")
    public ResponseEntity<EnrollmentResponse> getEnrollmentById(@Parameter @PathVariable("id") UUID enrollmentId, @NonNull Authentication authentication) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentById(enrollmentId, authentication));
    }


    @PreAuthorize("hasRole('LEARNER')")
    @Operation(summary = "Mark a learning step as completed")
    @PatchMapping("/{enrollmentId}/steps/{stepId}/complete")
    public ResponseEntity<Void> markLearningStepAsCompleted(@Parameter @PathVariable String enrollmentId, @Parameter @PathVariable String stepId, @NonNull Authentication authentication) {
        enrollmentService.markLearningStepAsCompleted(UUID.fromString(enrollmentId), UUID.fromString(stepId), authentication);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('LEARNER')")
    @Operation(summary = "Submit a quiz attempt for a learning step")
    @PostMapping("/{enrollmentId}/steps/{stepId}/submit")
    public ResponseEntity<QuizAttemptResponse> submitQuiz(
            @Parameter @PathVariable UUID enrollmentId,
            @Parameter @PathVariable UUID stepId,
           @Valid @RequestBody QuizAttemptRequest quizAttemptRequest,
            @NonNull Authentication authentication){
        QuizAttemptResponse attemptResponse = enrollmentService.submitQuiz(enrollmentId, stepId, quizAttemptRequest, authentication);
        return ResponseEntity.ok(attemptResponse);
    }

    @PreAuthorize("hasRole('LEARNER')")
    @Operation(summary = "Claim/Issue a certificate for a completed enrollment")
    @PostMapping("/{enrollmentId}/claim-certificate")
    public ResponseEntity<CertificateResponse> claimCertificate(
            @Parameter @PathVariable UUID enrollmentId,
            @NonNull Authentication authentication) {
        log.info("Claiming certificate for enrollment: {}", enrollmentId);
        CertificateResponse certificateResponse = enrollmentService.claimCertificate(enrollmentId, authentication);
        return ResponseEntity.accepted().body(certificateResponse);
    }

}

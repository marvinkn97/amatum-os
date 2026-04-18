package dev.marvin.enrollmentservice;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
@Slf4j
public class EnrollmentController {
    private EnrollmentService enrollmentService;

    @Operation(summary = "Enroll a learner")
    @PostMapping
    public ResponseEntity<EnrollmentResponse> enroll(@Valid @RequestBody EnrollmentRequest enrollmentRequest, @NonNull Authentication authentication){
        log.info("Received enrollment request {}", enrollmentRequest);
        EnrollmentResponse enrollmentResponse = enrollmentService.enroll(enrollmentRequest, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(enrollmentResponse);
    }
}

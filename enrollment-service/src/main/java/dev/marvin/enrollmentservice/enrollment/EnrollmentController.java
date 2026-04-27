package dev.marvin.enrollmentservice.enrollment;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Enrollments", description = "Enrollments API")
public class EnrollmentController {
    private final EnrollmentService enrollmentService;
    private final PagedResourcesAssembler<EnrollmentResponse> pagedResourcesAssembler;

    @Operation(summary = "Enroll a learner")
    @PostMapping
    public ResponseEntity<EnrollmentResponse> enroll(@Valid @RequestBody EnrollmentRequest enrollmentRequest, @NonNull Authentication authentication) {
        log.info("Received enrollment request {}", enrollmentRequest);
        EnrollmentResponse enrollmentResponse = enrollmentService.enroll(enrollmentRequest, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(enrollmentResponse);
    }

    @Operation(summary = "Check enrollment status for multiple courses")
    @GetMapping(value = "/check-status", params = "courseIds")
    public ResponseEntity<List<EnrollmentCheckResponse>> getEnrollmentStatus(@RequestParam List<UUID> courseIds, @NonNull Authentication authentication){
        log.info("Received enrollment check request for courses {}", courseIds);
        List<EnrollmentCheckResponse> checkResponseList = enrollmentService.getEnrollmentStatus(courseIds, authentication);
        return ResponseEntity.ok(checkResponseList);
    }


    @Operation(summary = "Check enrollment status for a single course")
    @GetMapping(value = "/check-status", params = "courseId")
    public ResponseEntity<EnrollmentCheckResponse> checkEnrollmentStatus(@RequestParam UUID courseId, @NonNull Authentication authentication){
        log.info("Received enrollment check request for course {}", courseId);
        EnrollmentCheckResponse checkResponse = enrollmentService.checkEnrollmentStatus(courseId, authentication);
        return ResponseEntity.ok(checkResponse);
    }
}

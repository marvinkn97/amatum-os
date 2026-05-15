package dev.marvin.ratingservice.rating;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Ratings", description = "Ratings API")
public class RatingController {
    private final RatingService ratingService;

    @Operation(summary = "Submit a rating")
    @PreAuthorize("hasRole('LEARNER')")
    @PostMapping
    public ResponseEntity<Void> submitRating(@Valid @RequestBody RatingRequest request) {
        ratingService.submitRating(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}

package dev.marvin.ratingservice.rating;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record RatingRequest(
        @NotNull
        UUID enrollmentId,
        @NotNull
        UUID courseId,
        @NotNull
        @Min(1)
        @Max(5)
        Integer rating,
        String comment
) {
}

package dev.marvin.courseservice.course;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CourseRequest(
        @NotBlank
        String title,
        @NotBlank
        String slug,
        @NotBlank
        String description,
        @NotEmpty
        @NotNull
        List<String> tags,
        @NotNull
        Boolean isFeatured,
        @NotNull
        CourseAccessTier accessTier,
        @NotNull
        BigDecimal price,
        @NotNull
        UUID categoryId
) {
}

package dev.marvin.courseservice.course;

import dev.marvin.courseservice.common.Status;
import dev.marvin.courseservice.module.ModuleResponse;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public record CourseResponse(
        UUID id,
        String title,
        String slug,
        String description,
        Set<String> tags,
        Boolean isFeatured,
        CourseAccessTier accessTier,
        BigDecimal price,
        UUID categoryId,
        Status status,
        Boolean isReadyToPublish,
        List<ModuleResponse> modules
) {

    public CourseResponse(
            UUID id,
            String title,
            String slug,
            String description,
            Set<String> tags,
            Boolean isFeatured,
            CourseAccessTier accessTier,
            BigDecimal price,
            UUID categoryId,
            Status status
    ) {
        this(id, title, slug, description, tags, isFeatured, accessTier, price, categoryId, status, null, Collections.emptyList());
    }
}

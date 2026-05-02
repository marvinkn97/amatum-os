package dev.marvin.courseservice.course;

import com.fasterxml.jackson.annotation.JsonInclude;
import dev.marvin.courseservice.common.Status;
import dev.marvin.courseservice.module.ModuleResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record CourseResponse(
        UUID id,
        String title,
        String slug,
        String description,
        Set<String> tags,
        Boolean isPublic,
        CourseAccessTier accessTier,
        BigDecimal price,
        UUID categoryId,
        Status status,
        Boolean isReadyToPublish,
        List<ModuleResponse> modules,
        Integer moduleCount,
        Integer learningStepCount,
        Boolean isEnrolled
) {

    public CourseResponse(
            UUID id,
            String title,
            String slug,
            String description,
            Set<String> tags,
            Boolean isPublic,
            CourseAccessTier accessTier,
            BigDecimal price,
            UUID categoryId,
            Status status
    ) {
        this(id, title, slug, description, tags, isPublic, accessTier, price, categoryId, status, null, null, null, null, null);
    }


    public CourseResponse(
            UUID id,
            String title,
            String slug,
            String description,
            Set<String> tags,
            Boolean isPublic,
            CourseAccessTier accessTier,
            BigDecimal price,
            UUID categoryId,
            Status status,
            Integer moduleCount,
            Integer learningStepCount
    ) {
        this(id, title, slug, description, tags, isPublic, accessTier, price, categoryId, status, null, null, moduleCount, learningStepCount, null);
    }


    public CourseResponse(
            UUID id,
            String title,
            String slug,
            String description,
            Set<String> tags,
            CourseAccessTier accessTier,
            BigDecimal price,
            List<ModuleResponse> modules,
            Integer moduleCount,
            Integer learningStepCount,
            Boolean isEnrolled
    ) {
        this(id, title, slug, description, tags, null, accessTier, price, null, null, null, modules, moduleCount, learningStepCount, isEnrolled);
    }

    public CourseResponse(
            UUID id,
            String title,
            String slug,
            String description,
            Set<String> tags,
            Boolean isPublic,
            CourseAccessTier accessTier,
            BigDecimal price,
            UUID categoryId,
            Status status,
            Boolean isReadyToPublish,
            List<ModuleResponse> modules,
            Integer moduleCount,
            Integer learningStepCount
    ) {
        this(
                id,
                title,
                slug,
                description,
                tags,
                isPublic,
                accessTier,
                price,
                categoryId,
                status,
                isReadyToPublish,
                modules,
                moduleCount,
                learningStepCount,
                null
        );
    }

    public CourseResponse(
            UUID id,
            String title,
            String slug,
            String description,
            Set<String> tags,
            CourseAccessTier accessTier,
            BigDecimal price,
            Integer moduleCount,
            Integer learningStepCount,
            Boolean isEnrolled
    ) {
        this(id, title, slug, description, tags, null, accessTier, price, null, null, null, null, moduleCount, learningStepCount, isEnrolled);
    }

    public CourseResponse(
            UUID id,
            String title,
            String slug,
            String description
    ) {
        this(id, title, slug, description, null, null, null, null, null, null, null, null, null, null, null);
    }

}

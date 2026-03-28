package dev.marvin.courseservice.course;

import dev.marvin.courseservice.module.ModuleResponse;

import java.util.List;

public class CourseMapper {
    private CourseMapper(){}

    public static CourseResponse mapToResponse(CourseEntity courseEntity){
        return new CourseResponse(
                courseEntity.getId(),
                courseEntity.getTitle(),
                courseEntity.getSlug(),
                courseEntity.getDescription(),
                courseEntity.getTags(),
                courseEntity.isFeatured(),
                courseEntity.getAccessTier(),
                courseEntity.getPrice(),
                courseEntity.getCategory().getId(),
                courseEntity.getStatus()
        );
    }


    public static CourseResponse mapToResponseWithModulesAndLessons(CourseEntity courseEntity, List<ModuleResponse> moduleResponses){
        return new CourseResponse(
                courseEntity.getId(),
                courseEntity.getTitle(),
                courseEntity.getSlug(),
                courseEntity.getDescription(),
                courseEntity.getTags(),
                courseEntity.isFeatured(),
                courseEntity.getAccessTier(),
                courseEntity.getPrice(),
                courseEntity.getCategory().getId(),
                courseEntity.getStatus(),
                moduleResponses
        );


    }

}

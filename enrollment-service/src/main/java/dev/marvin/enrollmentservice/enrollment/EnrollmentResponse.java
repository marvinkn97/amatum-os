package dev.marvin.enrollmentservice.enrollment;

import com.fasterxml.jackson.annotation.JsonInclude;
import dev.marvin.course.proto.LearningStepType;
import dev.marvin.enrollmentservice.exception.EnrollmentStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record EnrollmentResponse(
        UUID id,
        EnrollmentStatus status,
        Boolean isCompleted,
        Integer progress,
        UUID lastLearningStepId,
        LocalDateTime lastActivityAt,
        CourseView course
        ) {

        public EnrollmentResponse(UUID id, EnrollmentStatus status, Boolean isCompleted, Integer progress, UUID lastLearningStepId, LocalDateTime lastActivityAt) {
                this(id, status, isCompleted, progress,lastLearningStepId, lastActivityAt, null);
        }

        public sealed interface CourseView permits CourseSummaryDto, CourseResponse {
        }

        public record CourseSummaryDto(
                UUID id,
                String title,
                String slug
        ) implements CourseView {}


        @JsonInclude(JsonInclude.Include.NON_NULL)
        public record CourseResponse(
                UUID id,
                String title,
                String slug,
                String description,
                List<ModuleResponse> modules
        ) implements CourseView {}

        public record ModuleResponse(
                UUID id,
                String title,
                Integer sequence,
                List<LearningStepDto> learningSteps
//                ModuleProgressResponse progress
        ) {}

        @JsonInclude(JsonInclude.Include.NON_NULL)
        public record LearningStepDto(
                UUID id,
                String title,
                LearningStepType type,
                Integer sequence,
                Boolean videoEnabled,
                Boolean contentEnabled,
                Boolean materialsEnabled,
                String content,
                String videoPlaybackId,
                List<ResourceDto> resources,
                QuizDto quiz
        ) {}

        public record ResourceDto(
                UUID id,
                String name,
                String s3PreSignedUrl,
                String contentType,
                Long size
        ) {}

        public record QuizDto(
                UUID id,
                List<QuestionDto> questions
        ) {}

        public record QuestionDto(
                UUID id,
                String questionText,
                Boolean hasMultipleCorrectAnswers,
                List<AnswerDto> answers
        ) {}

        public record AnswerDto(
                UUID id,
                String answerText
        ) {}

}



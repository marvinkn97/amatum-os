package dev.marvin.enrollmentservice.enrollment;

public class EnrollmentMapper {
    private EnrollmentMapper(){}

    public static EnrollmentResponse mapToResponse(EnrollmentEntity enrollmentEntity){
        return new EnrollmentResponse(
                enrollmentEntity.getId(),
                enrollmentEntity.getStatus(),
                enrollmentEntity.isCompleted(),
                enrollmentEntity.getProgress(),
                enrollmentEntity.getLastLearningStepId(),
                enrollmentEntity.getUpdatedAt());
    }

    public static EnrollmentResponse mapToResponse(EnrollmentEntity enrollmentEntity, EnrollmentResponse.CourseView courseView){
        return new EnrollmentResponse(
                enrollmentEntity.getId(),
                enrollmentEntity.getStatus(),
                enrollmentEntity.isCompleted(),
                enrollmentEntity.getProgress(),
                enrollmentEntity.getLastLearningStepId(),
                enrollmentEntity.getUpdatedAt(),
                courseView);
    }
}

package dev.marvin.enrollmentservice.enrollment;

public class EnrollmentMapper {
    private EnrollmentMapper(){}

    public static EnrollmentResponse mapToResponse(EnrollmentEntity enrollmentEntity){
        return new EnrollmentResponse(enrollmentEntity.getId(), enrollmentEntity.getStatus(), enrollmentEntity.isCompleted(), 0);
    }
}

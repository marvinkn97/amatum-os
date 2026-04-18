package dev.marvin.enrollmentservice;

public class EnrollmentMapper {
    private EnrollmentMapper(){}

    public static EnrollmentResponse mapToResponse(EnrollmentEntity enrollmentEntity){
        return new EnrollmentResponse(enrollmentEntity.getId(), enrollmentEntity.getCourseId(), enrollmentEntity.getLearnerId(), enrollmentEntity.getStatus(), enrollmentEntity.isCompleted(), enrollmentEntity.getStartTime(), enrollmentEntity.getEndTime());
    }
}

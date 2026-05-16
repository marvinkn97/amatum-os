package dev.marvin.enrollmentservice.dashboard;

public record LearnerDashboardCountResponse(
        Long activeCount,
        Long completedCount,
        Long certificateCount
) {
}

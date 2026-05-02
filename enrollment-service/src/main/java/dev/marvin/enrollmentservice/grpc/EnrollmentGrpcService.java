package dev.marvin.enrollmentservice.grpc;

import dev.marvin.enrollment.proto.BulkEnrollmentCheckRequest;
import dev.marvin.enrollment.proto.BulkEnrollmentCheckResponse;
import dev.marvin.enrollment.proto.EnrollmentCheckRequest;
import dev.marvin.enrollment.proto.EnrollmentCheckResponse;
import dev.marvin.enrollmentservice.enrollment.EnrollmentService;
import dev.marvin.enrollment.proto.EnrollmentServiceGrpc.EnrollmentServiceImplBase;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.grpc.server.service.GrpcService;

import java.util.List;
import java.util.UUID;

@GrpcService
@RequiredArgsConstructor
@Slf4j
public class EnrollmentGrpcService extends EnrollmentServiceImplBase {
    private final EnrollmentService enrollmentService;

    @Override
    public void checkEnrollmentStatus(EnrollmentCheckRequest request, StreamObserver<EnrollmentCheckResponse> responseObserver) {
        try {
            log.info("Received enrollment check request: {}", request);
            UUID courseId = UUID.fromString(request.getCourseId());
            UUID learnerId = UUID.fromString(request.getLearnerId());

            var result = enrollmentService.checkEnrollmentStatus(courseId, learnerId);

            EnrollmentCheckResponse grpcResponse =
                    EnrollmentCheckResponse.newBuilder()
                            .setCourseId(result.courseId().toString())
                            .setEnrolled(result.isEnrolled())
                            .build();

            responseObserver.onNext(grpcResponse);
            responseObserver.onCompleted();

        } catch (Exception e) {
            log.error("Error checking enrollment status", e);
            responseObserver.onError(e);
        }
    }

    @Override
    public void checkEnrollmentStatuses(BulkEnrollmentCheckRequest request, StreamObserver<BulkEnrollmentCheckResponse> responseObserver) {
        try {
            log.info("Received bulk enrollment check request: {}", request);
            List<UUID> courseIds = request.getCourseIdsList().stream().map(UUID::fromString).toList();
            UUID learnerId = UUID.fromString(request.getLearnerId());

            List<EnrollmentCheckResponse> responses = enrollmentService.getEnrollmentStatus(courseIds, learnerId)
                    .stream()
                    .map(enrollmentCheckResponse -> EnrollmentCheckResponse.newBuilder()
                            .setCourseId(enrollmentCheckResponse.courseId().toString())
                            .setEnrolled(enrollmentCheckResponse.isEnrolled())
                            .build())
                    .toList();

            BulkEnrollmentCheckResponse grpcResponse =
                    BulkEnrollmentCheckResponse.newBuilder()
                            .addAllResults(responses)
                            .build();

            responseObserver.onNext(grpcResponse);
            responseObserver.onCompleted();

        } catch (Exception e) {
            log.error("Error checking enrollment statuses", e);
            responseObserver.onError(e);
        }
    }
}

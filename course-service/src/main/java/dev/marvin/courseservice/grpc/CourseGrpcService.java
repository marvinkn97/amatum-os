package dev.marvin.courseservice.grpc;

import course.proto.*;
import dev.marvin.courseservice.course.CourseService;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.grpc.server.service.GrpcService;

import java.util.List;
import java.util.UUID;

import static course.proto.CourseServiceGrpc.CourseServiceImplBase;

@GrpcService
@RequiredArgsConstructor
@Slf4j
public class CourseGrpcService extends CourseServiceImplBase {
    private final CourseService courseService;

    @Override
    public void getCourseDetails(CourseRequest request, StreamObserver<CourseResponse> responseObserver) {
       log.info("Received course request: {}", request);

       dev.marvin.courseservice.course.CourseResponse response = courseService.getCourseById(UUID.fromString(request.getCourseId()));

    }

    @Override
    public void getMultipleCourseSummaries(BulkCourseRequest request, StreamObserver<BulkCourseSummaryResponse> responseObserver) {
        log.info("Received bulk course request: {}", request);
        List<UUID> courseIds = request.getCourseIdsList().stream().map(UUID::fromString).toList();

         List<CourseSummaryResponse> responses = courseService.getCourseSummaryResponses(courseIds)
                .stream()
                .map(course -> CourseSummaryResponse.newBuilder()
                        .setId(course.id().toString())
                        .setTitle(course.title())
                        .setSlug(course.slug())
                        .setDescription(course.description())
                        .build())
                .toList();

         BulkCourseSummaryResponse grpcResponse = BulkCourseSummaryResponse.newBuilder()
                 .addAllCourses(responses)
                 .build();

         log.info("Sending bulk course summary response: {}", grpcResponse);

         responseObserver.onNext(grpcResponse);
         responseObserver.onCompleted();
    }
}

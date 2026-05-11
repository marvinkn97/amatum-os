package dev.marvin.enrollmentservice.grpc;

import dev.marvin.course.proto.*;
import io.grpc.ClientInterceptor;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import io.grpc.Metadata;
import io.grpc.stub.MetadataUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class CourseServiceGrpcClient {
    private final CourseServiceGrpc.CourseServiceBlockingStub blockingStub;

    public CourseServiceGrpcClient(
            @Value("${spring.grpc.client.course-service.address}") String serverAddress,
            @Value("${spring.grpc.client.course-service.port}") int serverPort
    ){
        log.info("Connecting to course service grpc server at {}:{}", serverAddress, serverPort);
        ManagedChannel channel = ManagedChannelBuilder.forAddress(serverAddress, serverPort)
                .usePlaintext()
                .build();

        blockingStub = CourseServiceGrpc.newBlockingStub(channel);
    }

    private CourseServiceGrpc.CourseServiceBlockingStub authenticatedStub() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assert auth != null;
        Jwt jwt = (Jwt) auth.getPrincipal();
        assert jwt != null;
        String token = jwt.getTokenValue();

        Metadata metadata = new Metadata();

        Metadata.Key<String> authorization =
                Metadata.Key.of("Authorization", Metadata.ASCII_STRING_MARSHALLER);

        metadata.put(authorization, "Bearer " + token);

        ClientInterceptor interceptor =
                MetadataUtils.newAttachHeadersInterceptor(metadata);

        return blockingStub
                .withInterceptors(interceptor)
                .withDeadlineAfter(5, java.util.concurrent.TimeUnit.SECONDS);
    }

    public BulkCourseSummaryResponse getMultipleCourseSummaries(List<String> courseIds) {
        log.info("Fetching course summaries for courseIds: {}", courseIds);
        try {
              BulkCourseRequest bulkCourseRequest = BulkCourseRequest.newBuilder()
                    .addAllCourseIds(courseIds)
                    .build();

            return authenticatedStub().getMultipleCourseSummaries(bulkCourseRequest);

        } catch (Exception e) {
            log.error(e.getMessage());
            throw e;
        }

    }

    public CourseResponse getCourseDetails(String courseId) {
        log.info("Fetching course details for courseId: {}", courseId);
        try {
            CourseResponse courseResponse = authenticatedStub().getCourseDetails(
                    dev.marvin.course.proto.CourseRequest.newBuilder()
                            .setCourseId(courseId)
                            .build()
            );
            log.info("Received course details response: {}", courseResponse);
            return courseResponse;

        } catch (Exception e) {
            log.error(e.getMessage());
            throw e;
        }
    }

    public CourseTotalStepsResponse getCourseTotalSteps(String courseId) {
        log.info("Fetching course total steps for courseId: {}", courseId);
        try {
            CourseTotalStepsResponse courseTotalStepsResponse = authenticatedStub().getCourseTotalSteps(
                    dev.marvin.course.proto.CourseRequest.newBuilder()
                            .setCourseId(courseId)
                            .build()
            );
            log.info("Received course total steps response: {}", courseTotalStepsResponse);
            return courseTotalStepsResponse;

        } catch (Exception e) {
            log.error(e.getMessage());
            throw e;
        }
    }

    public QuizResponse getQuizDetails(String quizId) {
        log.info("Fetching quiz details for quizId: {}", quizId);
        try {
            QuizResponse quizResponse = authenticatedStub().getQuizDetails(
                    dev.marvin.course.proto.QuizRequest.newBuilder()
                            .setQuizId(quizId)
                            .build()
            );
            log.info("Received quiz details response: {}", quizResponse);
            return quizResponse;

        } catch (Exception e) {
            log.error(e.getMessage());
            throw e;
        }
    }
}

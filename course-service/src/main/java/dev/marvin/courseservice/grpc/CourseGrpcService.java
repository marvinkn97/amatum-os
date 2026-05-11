package dev.marvin.courseservice.grpc;

import dev.marvin.course.proto.*;
import dev.marvin.courseservice.course.CourseService;
import dev.marvin.courseservice.learningstep.LearningStepService;
import dev.marvin.courseservice.quiz.quiz.QuizService;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.grpc.server.service.GrpcService;

import java.util.List;
import java.util.UUID;

import static dev.marvin.course.proto.CourseServiceGrpc.CourseServiceImplBase;
import static dev.marvin.courseservice.learningstep.LearningStepType.QUIZ;

@GrpcService
@RequiredArgsConstructor
@Slf4j
public class CourseGrpcService extends CourseServiceImplBase {
    private final CourseService courseService;
    private final LearningStepService learningStepService;
    private final QuizService quizService;

    @Override
    public void getCourseDetails(CourseRequest request, StreamObserver<CourseResponse> responseObserver) {
        log.info("Received course request: {}", request);

        try {
            dev.marvin.courseservice.course.CourseResponse course =
                    courseService.getGrpcCourseView(
                            UUID.fromString(request.getCourseId())
                    );

            CourseResponse.Builder courseBuilder = CourseResponse.newBuilder()
                    .setId(course.id().toString())
                    .setTitle(course.title())
                    .setSlug(course.slug())
                    .setDescription(course.description());

            // Modules
            for (var module : course.modules()) {

                ModuleResponse.Builder moduleBuilder = ModuleResponse.newBuilder()
                        .setId(module.id().toString())
                        .setTitle(module.title())
                        .setSequence(module.sequence());

                // Steps
                for (var step : module.learningSteps()) {
                    LearningStepResponse.Builder stepBuilder =
                            LearningStepResponse.newBuilder()
                                    .setId(step.getId().toString())
                                    .setTitle(step.getTitle())
                                    .setSequence(step.getSequence())
                                    .setType(
                                            switch (step.getType()) {
                                                case LESSON -> LearningStepType.LESSON;
                                                case QUIZ -> LearningStepType.QUIZ;
                                            }
                                    )
                                    .setVideoEnabled(step.isVideoEnabled())
                                    .setContentEnabled(step.isContentEnabled())
                                    .setMaterialsEnabled(step.isMaterialsEnabled());

                    if (step.isContentEnabled() && step.getContent() != null) {
                        stepBuilder.setContent(step.getContent());
                    }

                    if (step.isVideoEnabled() && step.getVideoPlaybackId() != null) {
                        stepBuilder.setVideoPlaybackId(step.getVideoPlaybackId());
                    }

                    // Resources
                    if (step.isMaterialsEnabled() && step.getResources() != null) {
                        for (var r : step.getResources()) {
                            stepBuilder.addResources(
                                    LearningStepResourceResponse.newBuilder()
                                            .setId(r.id().toString())
                                            .setName(r.name())
                                            .setS3PreSignedUrl(r.s3PreSignedUrl())
                                            .setContentType(r.contentType())
                                            .setSize(r.size())
                                            .build()
                            );
                        }
                    }

                    // Quiz
                    if (step.getType() == QUIZ && step.getQuiz() != null){
                        var quiz = step.getQuiz();

                        QuizResponse.Builder quizBuilder = QuizResponse.newBuilder()
                                .setId(quiz.id().toString());

                        for (var q : quiz.questions()) {
                            QuizQuestionResponse.Builder questionBuilder =
                                    QuizQuestionResponse.newBuilder()
                                            .setId(q.id().toString())
                                            .setQuestionText(q.questionText())
                                            .setHasMultipleCorrectAnswers(q.hasMultipleAnswers());

                            for (var a : q.answerOptions()) {
                                questionBuilder.addAnswers(
                                        QuizAnswerResponse.newBuilder()
                                                .setId(a.id().toString())
                                                .setAnswerText(a.answerText())
                                                .build()
                                );
                            }

                            quizBuilder.addQuestions(questionBuilder.build());
                        }

                        stepBuilder.setQuiz(quizBuilder.build());
                    }

                    moduleBuilder.addLearningSteps(stepBuilder.build());
                }

                courseBuilder.addModules(moduleBuilder.build());
            }

            responseObserver.onNext(courseBuilder.build());
            responseObserver.onCompleted();

        } catch (Exception e) {
            log.error("Error fetching course details", e);
            responseObserver.onError(e);
        }

    }

    @Override
    public void getMultipleCourseSummaries(BulkCourseRequest request, StreamObserver<BulkCourseSummaryResponse> responseObserver) {
        try {
            log.info("Received bulk course request: {}", request);
            List<UUID> courseIds = request.getCourseIdsList().stream().map(UUID::fromString).toList();

            List<CourseSummaryResponse> responses = courseService.getCourseSummaryResponses(courseIds)
                    .stream()
                    .map(course -> CourseSummaryResponse.newBuilder()
                            .setId(course.id().toString())
                            .setTitle(course.title())
                            .setSlug(course.slug())
                            .build())
                    .toList();

            BulkCourseSummaryResponse grpcResponse = BulkCourseSummaryResponse.newBuilder()
                    .addAllCourses(responses)
                    .build();

            log.info("Sending bulk course summary response: {}", grpcResponse);

            responseObserver.onNext(grpcResponse);
            responseObserver.onCompleted();

        } catch (Exception e) {
            log.error("Error fetching multiple course summaries", e);
            responseObserver.onError(e);
        }
    }

    @Override
    public void getCourseTotalSteps(CourseRequest request, StreamObserver<CourseTotalStepsResponse> responseObserver) {
        try {
            log.info("Received course total steps request: {}", request);
            UUID courseId = UUID.fromString(request.getCourseId());

            long stepCount = learningStepService.getCourseTotalSteps(courseId);

            CourseTotalStepsResponse grpcResponse = CourseTotalStepsResponse.newBuilder()
                    .setTotalSteps(stepCount)
                    .build();

            log.info("Sending course total steps response: {}", grpcResponse);
            responseObserver.onNext(grpcResponse);
            responseObserver.onCompleted();

        } catch (Exception e) {
            log.error("Error fetching course total steps", e);
            responseObserver.onError(e);
        }
    }

    @Override
    public void getQuizDetails(QuizRequest request, StreamObserver<QuizResponse> responseObserver) {
        try {
            log.info("Received quiz request: {}", request);
            UUID quizId = UUID.fromString(request.getQuizId());

            QuizResponse quiz = quizService.getGrpcQuizById(quizId);

            log.info("Sending quiz response: {}", quiz);

            responseObserver.onNext(quiz);
            responseObserver.onCompleted();

        } catch (Exception e) {
            log.error("Error fetching quiz details", e);
            responseObserver.onError(e);
        }

    }
}

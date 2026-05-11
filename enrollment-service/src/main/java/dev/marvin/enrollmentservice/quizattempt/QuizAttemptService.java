package dev.marvin.enrollmentservice.quizattempt;

import dev.marvin.course.proto.QuizAnswerResponse;
import dev.marvin.course.proto.QuizQuestionResponse;
import dev.marvin.course.proto.QuizResponse;
import dev.marvin.enrollmentservice.grpc.CourseServiceGrpcClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuizAttemptService {
    private final CourseServiceGrpcClient courseServiceGrpcClient;
    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizAttemptAnswerRepository quizAttemptAnswerRepository;

    @Value("${app.domain.quiz-attempt.passmark}")
    private int passMark;

    @Transactional
    public QuizAttemptResponse submitQuizAttempt(
            UUID learningStepId,
            QuizAttemptRequest request,
            UUID learnerId
    ) {

        log.info("Submitting quiz attempt for learning step {} and learner {}",
                learningStepId, learnerId);

        QuizResponse quiz =
                courseServiceGrpcClient.getQuizDetails(request.quizId().toString());

        Map<UUID, QuizAttemptAnswerRequest> submittedAnswersMap =
                request.selectedAnswers().stream()
                        .collect(Collectors.toMap(
                                QuizAttemptAnswerRequest::questionId,
                                Function.identity()
                        ));

        List<QuizAttemptAnswerResponse> evaluationResults = new ArrayList<>();
        List<QuizAttemptAnswerEntity> attemptAnswers = new ArrayList<>();

        int correctCount = 0;

        for (QuizQuestionResponse question : quiz.getQuestionsList()) {

            UUID questionId = UUID.fromString(question.getId());

            QuizAttemptAnswerRequest submitted =
                    submittedAnswersMap.get(questionId);

            List<QuizAnswerResponse> allAnswers =
                    question.getAnswersList();

            List<String> correctOptionTexts = allAnswers.stream()
                    .filter(QuizAnswerResponse::getIsCorrect)
                    .map(QuizAnswerResponse::getAnswerText)
                    .toList();

            Set<UUID> correctAnswerIds = allAnswers.stream()
                    .filter(QuizAnswerResponse::getIsCorrect)
                    .map(answer -> UUID.fromString(answer.getId()))
                    .collect(Collectors.toSet());

            List<String> selectedOptionTexts = new ArrayList<>();
            Set<UUID> selectedIds = Set.of();

            if (submitted != null) {

                selectedIds = submitted.selectedAnswerIds();

                Set<UUID> finalSelectedIds = selectedIds;

                selectedOptionTexts = allAnswers.stream()
                        .filter(answer ->
                                finalSelectedIds.contains(
                                        UUID.fromString(answer.getId())
                                )
                        )
                        .map(QuizAnswerResponse::getAnswerText)
                        .toList();
            }

            boolean isCorrect = correctAnswerIds.equals(selectedIds);

            if (isCorrect) {
                correctCount++;
            }

            evaluationResults.add(
                    new QuizAttemptAnswerResponse(
                            question.getQuestionText(),
                            selectedOptionTexts,
                            correctOptionTexts,
                            isCorrect
                    )
            );

            for (UUID selectedAnswerId : selectedIds) {

                attemptAnswers.add(
                        QuizAttemptAnswerEntity.builder()
                                .questionId(questionId)
                                .selectedAnswerId(selectedAnswerId)
                                .isCorrect(isCorrect)
                                .build()
                );
            }
        }

        int totalQuestions = quiz.getQuestionsCount();

        int score = totalQuestions == 0
                ? 0
                : (correctCount * 100) / totalQuestions;

        boolean passed = score >= passMark;

        QuizAttemptEntity quizAttempt = QuizAttemptEntity.builder()
                .quizId(request.quizId())
                .learnerId(learnerId)
                .learningStepId(learningStepId)
                .totalQuestions(totalQuestions)
                .correctCount(correctCount)
                .score(score)
                .build();

        quizAttemptRepository.save(quizAttempt);

        attemptAnswers.forEach(answer ->
                answer.setQuizAttempt(quizAttempt)
        );

        quizAttemptAnswerRepository.saveAll(attemptAnswers);

        return new QuizAttemptResponse(
                quizAttempt.getId(),
                totalQuestions,
                correctCount,
                score,
                passed,
                evaluationResults
        );
    }
}

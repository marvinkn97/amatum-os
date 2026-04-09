package dev.marvin.courseservice.quiz.quiz;


import dev.marvin.courseservice.learningstep.LearningStepEntity;
import dev.marvin.courseservice.quiz.answer.QuizAnswerOption;
import dev.marvin.courseservice.quiz.answer.QuizAnswerOptionRepository;
import dev.marvin.courseservice.quiz.answer.QuizAnswerOptionResponse;
import dev.marvin.courseservice.quiz.question.QuizQuestion;
import dev.marvin.courseservice.quiz.question.QuizQuestionRepository;
import dev.marvin.courseservice.quiz.question.QuizQuestionRequest;
import dev.marvin.courseservice.quiz.question.QuizQuestionResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuizService {
    private final QuizRepository quizRepository;
    private final QuizAnswerOptionRepository quizAnswerOptionRepository;
    private final QuizQuestionRepository quizQuestionRepository;

    @Transactional
    public QuizResponse saveOrUpdateQuiz(LearningStepEntity step, List<QuizQuestionRequest> requests) {
        log.info("Saving quiz for learning step {}", step.getId());

        // 1. Root Entity
        QuizEntity quiz = quizRepository.findByLearningStepEntity_Id(step.getId())
                .orElseGet(() -> quizRepository.save(QuizEntity.builder()
                        .learningStepEntity(step)
                        .build()));

        // 2. Manual SQL-style Cleanup
        List<QuizQuestion> existing = quizQuestionRepository.findByQuizEntity_Id(quiz.getId());
        if (!existing.isEmpty()) {
            log.info("Deleting {} existing questions for quiz: {}", existing.size(), quiz.getId());
            quizAnswerOptionRepository.deleteAllByQuizQuestionIn(existing);
            quizAnswerOptionRepository.flush();

            quizQuestionRepository.deleteAllInBatch(existing);
            quizQuestionRepository.flush();
        }

        // 3. Process and Persist
        List<QuizQuestionResponse> questionResponses = new ArrayList<>();

        for (QuizQuestionRequest qReq : requests) {
            // Persist Question
            QuizQuestion question = quizQuestionRepository.save(QuizQuestion.builder()
                    .quizEntity(quiz)
                    .questionText(qReq.questionText())
                    .hasMultipleAnswers(qReq.hasMultipleAnswers())
                    .build());

            // Persist Options (Bidirectional: setting the question reference)
            List<QuizAnswerOption> options = qReq.answerOptions().stream()
                    .map(oReq -> QuizAnswerOption.builder()
                            .quizQuestion(question)
                            .answerText(oReq.answerText())
                            .isCorrect(oReq.isCorrect())
                            .build())
                    .toList();

            quizAnswerOptionRepository.saveAll(options);

            // 4. Map to Response DTOs immediately
            List<QuizAnswerOptionResponse> optionResponses = options.stream()
                    .map(o -> new QuizAnswerOptionResponse(o.getId(), o.getAnswerText(), o.isCorrect()))
                    .toList();

            questionResponses.add(new QuizQuestionResponse(
                    question.getId(),
                    question.getQuestionText(),
                    question.isHasMultipleAnswers(),
                    optionResponses
            ));
        }

        return new QuizResponse(quiz.getId(), questionResponses);
    }

}

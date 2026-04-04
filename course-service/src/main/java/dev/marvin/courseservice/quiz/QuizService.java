package dev.marvin.courseservice.quiz;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuizService {
    private final QuizRepository quizRepository;
    private final QuizAnswerOptionRepository quizAnswerOptionRepository;
    private final QuizQuestionRepository quizQuestionRepository;
}

package dev.marvin.courseservice.quiz.util;

import dev.marvin.courseservice.quiz.question.QuizQuestionRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;
// Use the new Jackson 3 imports consistently
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

@Component
@RequiredArgsConstructor
public class StringToQuizQuestionListConverter implements Converter<String, List<QuizQuestionRequest>> {

    private final ObjectMapper objectMapper;

    @Override
    public List<QuizQuestionRequest> convert(String source) {
        if (source == null || source.isBlank() || source.equals("[]")) {
            return List.of();
        }
        try {
            // In Jackson 3, ensure the TypeReference is from tools.jackson.core
            return objectMapper.readValue(source, new TypeReference<>() {
            });
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to parse Quiz Questions JSON from Form Data", e);
        }
    }
}
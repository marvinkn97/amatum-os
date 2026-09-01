package dev.marvin.talemaiservice.api;

import dev.marvin.talemaiservice.exception.AnswerNotRelevantException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.evaluation.RelevancyEvaluator;
import org.springframework.ai.evaluation.EvaluationRequest;
import org.springframework.ai.evaluation.EvaluationResponse;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class TalemaiService {
    private final ChatClient chatClient;
    private final VectorStore vectorStore;
    private final RelevancyEvaluator relevancyEvaluator;

    public Flux<String> sampleCall(TalemaiRequest request){
        return chatClient.prompt()
                .user(request.question())
                .stream()
                .content();
    }





    private void evaluateRelevancy(String question){
        String answer = Objects.requireNonNull(chatClient.prompt()
                .user(question)
                .call()
                .content());

        EvaluationRequest evaluationRequest = new EvaluationRequest(question, answer);
        EvaluationResponse response = relevancyEvaluator.evaluate(evaluationRequest);
        if(!response.isPass()){
            throw new AnswerNotRelevantException(response.getFeedback());
        }
    }

}

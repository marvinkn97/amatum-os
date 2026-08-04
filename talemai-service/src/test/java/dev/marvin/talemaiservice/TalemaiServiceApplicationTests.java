package dev.marvin.talemaiservice;

import lombok.extern.slf4j.Slf4j;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.evaluation.FactCheckingEvaluator;
import org.springframework.ai.chat.evaluation.RelevancyEvaluator;
import org.springframework.ai.document.Document;
import org.springframework.ai.evaluation.EvaluationRequest;
import org.springframework.ai.evaluation.EvaluationResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;


@SpringBootTest
@Slf4j
class TalemaiServiceApplicationTests {

    @Autowired
    private TalemaiService talemaiService;

    @Autowired
    private ChatClient.Builder chatClientBuilder;

    private RelevancyEvaluator relevancyEvaluator;
    private FactCheckingEvaluator factCheckingEvaluator;

    @BeforeEach
    void setUp() {
        this.relevancyEvaluator = new RelevancyEvaluator(chatClientBuilder);
        this.factCheckingEvaluator = FactCheckingEvaluator.builder(chatClientBuilder).build();
    }

    @Test
    void contextLoads() {
    }

    @Test
    void evaluateRelevancy() {
        String question = "Why is the sky blue?";

        String answer = talemaiService.sampleCall(question);

        EvaluationRequest evaluationRequest = new EvaluationRequest(question, answer);

        EvaluationResponse response = relevancyEvaluator.evaluate(evaluationRequest);

        Assertions.assertThat(response.isPass())
                .withFailMessage("""
                        ========================================
                        The answer "%s"
                        is not considered relevant to the question
                        "%s".
                        ========================================
                        """, answer, question)
                .isTrue();
    }


    @Test
    void evaluateFactualAccuracy() {
        String question = "Why is the sky blue?";

        String answer = talemaiService.sampleCall(question);

        // Note: FactCheckingEvaluator expects a context/document to verify the claim against.
        // If your service uses RAG, supply the retrieved context document.
        String context = "Rayleigh scattering of sunlight by molecules in the atmosphere causes the sky to look blue.";

        Document document = new Document(context);

        EvaluationRequest evaluationRequest = new EvaluationRequest(question, List.of(document), answer);

        EvaluationResponse response = factCheckingEvaluator.evaluate(evaluationRequest);

        Assertions.assertThat(response.isPass())
                .withFailMessage("""
                        ========================================
                        The answer "%s"
                        is not considered correct for the question
                        "%s".
                        ========================================
                        """, answer, question)
                .isTrue();
    }

}

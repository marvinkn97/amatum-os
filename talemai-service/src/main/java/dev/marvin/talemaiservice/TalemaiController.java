package dev.marvin.talemaiservice;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/talemai")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Talemai", description = "Talemai API")
public class TalemaiController {
    private final TalemaiService talemaiService;
    private final ChatClient chatClient;

    @PostMapping("/ask")
    public String askTalemai(@Valid @RequestBody String question) {
        return chatClient.prompt()
                .system("""
                        "You are a helpful assistant. Respond to the user's question in a concise manner.
                         For any response requiring structured data, use Markdown formatting: use headers (###) for sections,
                         bullet points for lists, and triple backticks (```) for all code snippets.
                          Keep complex explanations organized with logical nesting."
                        """)
                .user(question)
                .call().content();
    }
}

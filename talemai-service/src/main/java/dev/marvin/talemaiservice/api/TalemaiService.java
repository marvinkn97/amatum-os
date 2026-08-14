package dev.marvin.talemaiservice.api;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
@RequiredArgsConstructor
@Slf4j
public class TalemaiService {
    private final ChatClient chatClient;

    public Flux<String> sampleCall(TalemaiRequest request){
        return chatClient.prompt()
                .user(request.question())
                .stream()
                .content();
    }

}

package dev.marvin.talemaiservice;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class TalemaiService {
    private final ChatClient chatClient;

    public String sampleCall(String question){
        return chatClient.prompt()
                .user(question)
                .call()
                .content();
    }

}

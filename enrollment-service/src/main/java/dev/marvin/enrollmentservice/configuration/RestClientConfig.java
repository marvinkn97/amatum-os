package dev.marvin.enrollmentservice.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Value("${gotenberg.url}")
    private String gotenbergUrl;

    @Bean
    public RestClient gotenbergClient() {
        return RestClient.builder()
                .baseUrl(gotenbergUrl)
                .build();
    }
}
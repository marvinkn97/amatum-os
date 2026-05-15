package dev.marvin.ratingservice.configuration;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    @Bean
    public NewTopic ratingTopic() {
        return TopicBuilder.name("rating-topic")
                .partitions(3)
                .replicas(1)
                .config("min.insync.replicas", "1")
                .build();
    }
}
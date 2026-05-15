package dev.marvin.enrollmentservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.kafka.annotation.EnableKafka;

@SpringBootApplication
@EnableKafka
public class EnrollmentServiceApplication {
    static void main(String[] args) {
        SpringApplication.run(EnrollmentServiceApplication.class, args);
    }

}

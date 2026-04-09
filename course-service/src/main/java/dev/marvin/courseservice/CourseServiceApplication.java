package dev.marvin.courseservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class CourseServiceApplication {
    static void main(String[] args) {
        SpringApplication.run(CourseServiceApplication.class, args);
    }
}

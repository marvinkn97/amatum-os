package dev.marvin.enrollmentservice.configuration;

import com.github.jknack.handlebars.Handlebars;
import com.github.jknack.handlebars.Template;
import com.github.jknack.handlebars.io.ClassPathTemplateLoader;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

@Configuration
public class HandlebarsConfig {

    @Bean
    public Template certificateTemplate() throws IOException {
        // Points to src/main/resources/templates
        ClassPathTemplateLoader loader = new ClassPathTemplateLoader();
        loader.setPrefix("/templates");
        loader.setSuffix(".html");

        Handlebars handlebars = new Handlebars(loader);
        
        // This compiles the file 'certificate.html' once at startup
        return handlebars.compile("certificate");
    }
}
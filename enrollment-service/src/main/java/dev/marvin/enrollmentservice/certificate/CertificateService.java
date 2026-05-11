package dev.marvin.enrollmentservice.certificate;

import com.github.jknack.handlebars.Template;
import dev.marvin.enrollmentservice.grpc.CourseServiceGrpcClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
@Slf4j
public class CertificateService {
    private final Template certificateTemplate;
    private final CertificateRepository certificateRepository;
    private final RestClient gotenbergClient;
    private CourseServiceGrpcClient courseServiceGrpcClient;

    public CertificateEntity issueCertificate(CertificateRequest request) throws IOException {
        log.info("Issuing certificate for enrollment {} and learner {}",request.enrollmentId(), request.learnerId());


        String title = courseServiceGrpcClient.getCourseDetails(request.courseId().toString()).getTitle();


        CertificateEntity certificate = CertificateEntity.builder()
                .build();

        return null;
    }





    private byte[] generatePdf(String htmlContent) {
        // MultiValueMap is the standard for RestClient multipart requests
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        // Add the HTML file as a resource-like byte array
        var resource = new ByteArrayResource(htmlContent.getBytes(StandardCharsets.UTF_8)) {
            @Override
            public String getFilename() { return "certificate.html"; }
        };

        body.add("files", resource);
        body.add("landscape", "true");

        return gotenbergClient.post()
                .uri("/forms/chromium/convert/html")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body)
                .retrieve()
                .body(byte[].class);
    }
}

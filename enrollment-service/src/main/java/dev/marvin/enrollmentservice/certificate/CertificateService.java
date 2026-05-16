package dev.marvin.enrollmentservice.certificate;

import com.github.jknack.handlebars.Template;
import dev.marvin.enrollmentservice.exception.ServiceException;
import dev.marvin.enrollmentservice.grpc.CourseServiceGrpcClient;
import dev.marvin.enrollmentservice.grpc.IdentityServiceGrpcClient;
import dev.marvin.enrollmentservice.security.TenantContext;
import dev.marvin.enrollmentservice.storage.rustfs.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CertificateService {
    private final Template certificateTemplate;
    private final CertificateRepository certificateRepository;
    private final RestClient gotenbergClient;
    private final CourseServiceGrpcClient courseServiceGrpcClient;
    private final IdentityServiceGrpcClient identityServiceGrpcClient;
    private final S3Service s3Service;

    public CertificateResponse issueCertificate(CertificateRequest request) {
        try {
            log.info("Issuing certificate for enrollment {} and learner {}", request.enrollmentId(), request.learnerId());

            Optional<CertificateEntity> existingCert = certificateRepository.findByEnrollmentIdAndLearnerId(request.enrollmentId(), request.learnerId());
            if (existingCert.isPresent()) {
                log.info("Certificate already exists for enrollment {}. Returning existing record.", request.enrollmentId());
                CertificateEntity cert = existingCert.get();
                return new CertificateResponse(
                        cert.getSerialNumber(),
                        cert.getTitle(),
                        cert.getCertificateUrl(),
                        cert.getIssuedAt()
                );
            }

            LocalDateTime now = LocalDateTime.now();
            String formattedDate = now.format(DateTimeFormatter.ofPattern("MMMM dd, yyyy"));

            var course = courseServiceGrpcClient.getCourseDetails(request.courseId().toString());
            var user = identityServiceGrpcClient.getUserProfile(request.learnerId().toString());

            // Handle Missing Tenant (B2C Context)
            String companyName;
            if (request.tenantId() == null) {
                // Valid B2C/Independent Learner path
                companyName = "AMATUM";
                log.info("No tenantId found; using default issuer branding.");
            } else {
                // B2B path: Must succeed or the whole process fails
                var org = identityServiceGrpcClient.getOrganizationDetails(request.tenantId());
                companyName = org.getName();
            }

            UUID serialNumber = UUID.randomUUID();

            Map<String, Object> context = Map.of(
                    "certId", serialNumber.toString(),
                    "learnerName", user.getFirstName() + " " + user.getLastName(),
                    "courseTitle", course.getTitle(),
                    "companyName", companyName,
                    "issuedDate", formattedDate
            );

            String html = certificateTemplate.apply(context);
            byte[] pdfBytes = generatePdf(html);
            String fileName = "certs/" + serialNumber + ".pdf";
            String publicUrl = s3Service.uploadCertificate(pdfBytes, fileName);

            CertificateEntity certificate = CertificateEntity.builder()
                    .title(course.getTitle())
                    .learnerId(request.learnerId())
                    .enrollmentId(request.enrollmentId())
                    .serialNumber(serialNumber)
                    .certificateUrl(publicUrl)
                    .issuedAt(now)
                    .tenantId(request.tenantId())
                    .build();

            certificate = certificateRepository.save(certificate);

            return new CertificateResponse(
                    certificate.getSerialNumber(),
                    certificate.getCertificateUrl(),
                    certificate.getCertificateUrl(),
                    certificate.getIssuedAt()
            );

        } catch (Exception e) {
            log.error("Failed to issue certificate", e);
            throw new ServiceException("Failed to issue certificate: " + e.getMessage());
        }
    }


    private byte[] generatePdf(String htmlContent) {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        var resource = new ByteArrayResource(htmlContent.getBytes(StandardCharsets.UTF_8)) {
            @Override
            public String getFilename() { return "index.html"; }
        };

        body.add("files", resource);

        // FORCING THE DESIGN:
        // This tells Chromium to ignore "Print" defaults and use "Screen" styling
        body.add("emulatedMediaType", "screen");
        body.add("printBackground", "true");
        body.add("landscape", "true");

        // Give Tailwind 1 second to actually execute and paint the background
        body.add("waitDelay", "1s");

        return gotenbergClient.post()
                .uri("/forms/chromium/convert/html")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body)
                .retrieve()
                .body(byte[].class);
    }

    @Transactional(readOnly = true)
    public Page<CertificateResponse> getAll(Authentication authentication, Pageable pageable) {
        UUID learnerId = UUID.fromString(authentication.getName());
        String activeTenantId = TenantContext.TENANT_ID.isBound() ? TenantContext.TENANT_ID.get() : null;
        log.info("Getting certificates for learner {} and tenant {}", learnerId, activeTenantId);

        return certificateRepository.findByLearnerIdAndTenantId(learnerId, activeTenantId, pageable)
                .map(cert -> new CertificateResponse(
                        cert.getSerialNumber(),
                        cert.getTitle(),
                        cert.getCertificateUrl(),
                        cert.getIssuedAt()
                ));
    }

    @Transactional(readOnly = true)
    public long countByLearnerIdAndTenantId(UUID learnerId, String tenantId) {
        return certificateRepository.countByLearnerIdAndTenantId(learnerId, tenantId);
    }
}

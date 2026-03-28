package dev.marvin.courseservice.storage.rustfs;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3Service {
    private final software.amazon.awssdk.services.s3.presigner.S3Presigner s3Presigner;

    @Value("${storage.rustfs.bucket}")
    private String bucketName;


    public PresignedUrlResponse generateUploadUrl(S3UploadRequest request) {
        log.info("Generating presigned URL for file: {}", request.fileName());
        // Generate a unique key for storage
        String objectKey = "lessons/resources/" + UUID.randomUUID() + "-" + request.fileName();

        // Use the Consumer Builder (lambda) for the Presign Request
        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(p -> p
                .signatureDuration(Duration.ofMinutes(15))
                .putObjectRequest(por -> por
                        .bucket(bucketName)
                        .key(objectKey)
                        .contentType(request.contentType())
                        .build()) // Only one build() call at the end of the request chain
        );

        log.info("Presigned URL: {}", presignedRequest.url());

        return new PresignedUrlResponse(
                presignedRequest.url().toString(),
                objectKey
        );
    }

    // Simple DTO to send both the URL and the Key back to Angular
    public record PresignedUrlResponse(String uploadUrl, String objectKey) {}
}
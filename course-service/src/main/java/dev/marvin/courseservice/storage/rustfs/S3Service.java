package dev.marvin.courseservice.storage.rustfs;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3Service {
    private final S3Presigner s3Presigner;
    private final S3Client s3Client;

    @Value("${storage.rustfs.bucket}")
    private String bucketName;


    public PresignedUrlResponse generateUploadUrl(S3UploadRequest request) {
        try {
            log.info("Generating presigned URL for file: {}", request.fileName());

            // Generate a unique key for storage
            String objectKey = "lessons/resources/" + UUID.randomUUID() + "-" + request.fileName();

            // Perform the signing operation
            PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(p -> p
                    .signatureDuration(Duration.ofMinutes(15))
                    .putObjectRequest(por -> por
                            .bucket(bucketName)
                            .key(objectKey)
                            .contentType(request.contentType())
                            .build())
            );

            log.info("Successfully generated Presigned URL for key: {}", objectKey);

            return new PresignedUrlResponse(
                    presignedRequest.url().toString(),
                    objectKey
            );

        } catch (SdkException e) {
            log.error("SDK Error while generating presigned URL for {}: {}", request.fileName(), e.getMessage());
            throw new RuntimeException("Cloud storage configuration error", e);
        } catch (Exception e) {
            log.error("Unexpected error during presigned URL generation: ", e);
            throw new RuntimeException("Failed to initiate upload process", e);
        }
    }

    public void deleteFile(String objectKey) {
        log.info("Deleting object from RustFS: {}", objectKey);
        try {
            // We use the regular S3Client for direct deletions (not presigning)
            // Ensure you have an S3Client bean in your S3Config
            s3Client.deleteObject(d -> d
                    .bucket(bucketName)
                    .key(objectKey)
                    .build()
            );
            log.info("Successfully deleted: {}", objectKey);
        } catch (Exception e) {
            log.error("Failed to delete object from S3: {}", objectKey, e);
            throw new RuntimeException("Cloud storage deletion failed");
        }
    }

    public String generatePresignedUrl(String objectKey) {
        try {
            return s3Presigner.presignGetObject(p -> p
                    .signatureDuration(Duration.ofMinutes(15))
                    .getObjectRequest(g -> g
                            .bucket(bucketName)
                            .key(objectKey)
                    )
            ).url().toString();

        } catch (software.amazon.awssdk.core.exception.SdkException e) {
            log.error("SDK Error while generating download URL for {}: {}", objectKey, e.getMessage());
            throw new RuntimeException("Cloud storage configuration error", e);

        } catch (Exception e) {
            log.error("Unexpected error while generating download URL: {}", objectKey, e);
            throw new RuntimeException("Failed to generate download URL", e);
        }
    }

    // Simple DTO to send both the URL and the Key back to Angular
    public record PresignedUrlResponse(String uploadUrl, String objectKey) {}
}
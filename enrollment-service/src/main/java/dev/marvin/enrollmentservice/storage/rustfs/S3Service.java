package dev.marvin.enrollmentservice.storage.rustfs;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3Service {
    private final S3Client s3Client;

    @Value("${storage.rustfs.bucket}")
    private String bucketName;

    public String uploadCertificate(byte[] content, String fileName) {
        log.info("Uploading public certificate {} to RustFS", fileName);

        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType("application/pdf")
                    .acl(ObjectCannedACL.PUBLIC_READ) // Make the object publicly readable
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(content));

            // Use the SDK's built-in utilities to construct the URL cleanly
            return s3Client.utilities()
                    .getUrl(builder -> builder.bucket(bucketName).key(fileName))
                    .toExternalForm();

        } catch (Exception e) {
            log.error("Failed to upload to RustFS: {}", e.getMessage());
            throw new RuntimeException("Failed to upload to RustFS", e);
        }
    }

}
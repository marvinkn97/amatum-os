package dev.marvin.courseservice.storage.rustfs;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/uploads/s3")
@RequiredArgsConstructor
@Tag(name = "S3 Upload", description = "S3 Upload API")
@Slf4j
public class S3UploadController {
    private final S3Service s3Service;

    @PostMapping("/upload-url")
    public ResponseEntity<S3Service.PresignedUrlResponse> getUploadUrl(@Valid @RequestBody S3UploadRequest request) {
        log.info("Received S3 upload request: {}", request.toString());
        // Call the service to generate the valet key (URL) and the ID (Object Key)
        S3Service.PresignedUrlResponse response = s3Service.generateUploadUrl(request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/remove")
    public ResponseEntity<Void> removeFile(@RequestParam String objectKey) {
        log.info("Request to remove file with key: {}", objectKey);
        s3Service.deleteFile(objectKey);
        return ResponseEntity.ok().build();
    }
}
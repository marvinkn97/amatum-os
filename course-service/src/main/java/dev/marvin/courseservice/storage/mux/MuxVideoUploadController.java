package dev.marvin.courseservice.storage.mux;

import com.mux.sdk.models.UploadResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/uploads/mux")
@RequiredArgsConstructor
@Tag(name = "Mux Video Upload", description = "Mux Video Upload API")
@Slf4j
public class MuxVideoUploadController {
    private final MuxVideoUploadService muxVideoUploadService;

    @PostMapping("/upload-url")
    public ResponseEntity<UploadResponse> getUploadUrl() {
        log.info("Generating Mux upload URL");
        UploadResponse uploadData = muxVideoUploadService.createUploadUrl();
        log.info("UploadResponse: {}", uploadData.toString());
        return ResponseEntity.ok(uploadData);
    }

    @PostMapping("/webhooks")
    public ResponseEntity<Void> handleMuxWebhook(@RequestBody String payload) {
        log.info("Received Mux webhook payload: {}", payload);
        muxVideoUploadService.processWebhook(payload);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{uploadId}")
    public ResponseEntity<Void> deleteMuxUpload(@PathVariable String uploadId) {
        log.info("Deleting Mux upload with ID: {}", uploadId);
        muxVideoUploadService.deleteUpload(uploadId);
        return ResponseEntity.noContent().build();
    }
}

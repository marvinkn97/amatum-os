package dev.marvin.courseservice.storage.mux;

import com.mux.sdk.models.UploadResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mux")
@RequiredArgsConstructor
@Tag(name = "Mux Video Upload", description = "Mux Video Upload API")
@Slf4j
public class MuxVideoUploadController {
    private final MuxVideoUploadService muxVideoUploadService;

    @Operation(summary = "Get Mux upload URL")
    @PostMapping("/upload-url")
    public ResponseEntity<UploadResponse> getUploadUrl() {
        log.info("Generating Mux upload URL");
        UploadResponse uploadData = muxVideoUploadService.createUploadUrl();
        log.info("UploadResponse: {}", uploadData.toString());
        return ResponseEntity.ok(uploadData);
    }

    @Operation(summary = "Delete Mux upload")
    @DeleteMapping("/uploads/{id}")
    public ResponseEntity<Void> deleteMuxUpload(@PathVariable("id") String uploadId) {
        log.info("Deleting Mux upload with ID: {}", uploadId);
        muxVideoUploadService.deleteUpload(uploadId);
        return ResponseEntity.ok().build();
    }


    @Operation(summary = "Delete Mux Asset")
    @DeleteMapping("/assets/{id}")
    public ResponseEntity<Void> deleteMuxAsset(@PathVariable("id") String assetId) {
        log.info("Deleting Mux asset with ID: {}", assetId);
        muxVideoUploadService.deleteAsset(assetId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Handle Mux webhook")
    @PostMapping("/webhooks")
    public ResponseEntity<Void> handleMuxWebhook(
            @RequestHeader("Mux-Signature") String muxSignature,
            @RequestBody String payload) { // Use raw String to keep the signature valid
        log.info("Received Mux webhook payload: {}", payload);
        boolean success = muxVideoUploadService.processWebhook(payload, muxSignature);

        if (!success) {
            // 404 tells Mux: "I don't have this yet, try again in a few minutes!"
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.ok().build();
    }
}

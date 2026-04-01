package dev.marvin.courseservice.storage.mux;

import com.mux.ApiClient;
import com.mux.ApiException;
import com.mux.Configuration;
import com.mux.auth.HttpBasicAuth;
import com.mux.sdk.AssetsApi;
import com.mux.sdk.DirectUploadsApi;
import com.mux.sdk.models.*;
import dev.marvin.courseservice.lesson.LessonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MuxVideoUploadService {
    private final LessonRepository lessonRepository;
    private final ObjectMapper objectMapper;

    @Value("${mux.api.base-url}")
    private String baseUrl;

    @Value("${mux.api.token-id}")
    private String tokenId;

    @Value("${mux.api.token-secret}")
    private String tokenSecret;

    @Value("${app.lumina-client-url}")
    private String luminaClientUrl;

    @Value("${mux.webhook-secret}")
    private String webhookSecret;

    /**
     * Helper to configure the Mux API client with your credentials
     */
    private DirectUploadsApi getDirectUploadsApi() {
        // 1. Configure the Shared Client
        ApiClient defaultClient = Configuration.getDefaultApiClient();
        // 2. Setup Basic Auth (ID = Username, Secret = Password)
        HttpBasicAuth accessToken = (HttpBasicAuth) defaultClient.getAuthentication("accessToken");
        accessToken.setUsername(tokenId);
        accessToken.setPassword(tokenSecret);

        return new DirectUploadsApi(defaultClient);
    }

    private AssetsApi getAssetsApi() {
        ApiClient defaultClient = Configuration.getDefaultApiClient();
        HttpBasicAuth accessToken = (HttpBasicAuth) defaultClient.getAuthentication("accessToken");
        accessToken.setUsername(tokenId);
        accessToken.setPassword(tokenSecret);
        return new AssetsApi(defaultClient);
    }

    public UploadResponse createUploadUrl() {
        log.info("Creating Mux upload URL");
        // 3. Initialize the Direct Uploads API
        DirectUploadsApi apiInstance = getDirectUploadsApi();

        // 4. Configure the Upload Request
        // We tell Mux what settings the video should have once it's finished uploading
        CreateAssetRequest assetSettings = new CreateAssetRequest()
                .playbackPolicy(List.of(PlaybackPolicy.PUBLIC));

        CreateUploadRequest uploadRequest = new CreateUploadRequest()
                .newAssetSettings(assetSettings)
                .corsOrigin(luminaClientUrl); // Crucial for Angular uploads

        try {
            // 5. Execute and return the Mux response
            return apiInstance.createDirectUpload(uploadRequest).execute();
        } catch (ApiException e) {
            log.info("Status code: {}", e.getCode());
            log.info("Reason: {}", e.getResponseBody());
            throw new RuntimeException("Mux API Error: " + e.getResponseBody());
        }
    }


    public void processWebhook(String payload) {
        try {
            JsonNode node = objectMapper.readTree(payload);
            String eventType = node.get("type").asString();

            log.info("Mux Webhook received: {}", eventType);

            if ("video.asset.ready".equals(eventType)) {
                JsonNode data = node.get("data");
                String uploadId = data.get("upload_id").asString();

                // Mux sends an array of playback IDs; usually we want the first public one
                String playbackId = data.get("playback_ids").get(0).get("id").asString();

                updateLessonWithPlaybackId(uploadId, playbackId);
            }
        } catch (Exception e) {
            log.error("Error parsing Mux webhook", e);
        }
    }

    public void deleteUpload(String uploadId) {
        DirectUploadsApi uploadApi = getDirectUploadsApi();
        AssetsApi assetsApi = getAssetsApi();

        try {
            // 1. Fetch the upload metadata
            UploadResponse uploadResponse = uploadApi.getDirectUpload(uploadId).execute();
            Upload uploadData = uploadResponse.getData();

            // 2. Identify the current status using the Enum
            assert uploadData != null;
            Upload.StatusEnum status = uploadData.getStatus();
            String assetId = uploadData.getAssetId();

            log.info("Cleanup for Upload ID: {} | Status: {}", uploadId, status);

            // 3. Delete the Asset if it exists
            // Based on your class, assetId is set once state is ASSET_CREATED
            if (assetId != null && !assetId.isBlank()) {
                assetsApi.deleteAsset(assetId).execute();
                log.info("Successfully deleted Mux Asset: {}", assetId);
            }

            // 4. Handle the Direct Upload record cancellation
            // We only cancel if it hasn't reached a 'final' success state.
            // According to Mux, you cannot cancel an upload that is ASSET_CREATED.
            if (status != Upload.StatusEnum.ASSET_CREATED &&
                    status != Upload.StatusEnum.CANCELLED &&
                    status != Upload.StatusEnum.TIMED_OUT) {

                uploadApi.cancelDirectUpload(uploadId).execute();
                log.info("Direct Upload record cancelled.");
            } else {
                log.info("No cancel needed for status: {}", status);
            }

        } catch (ApiException e) {
            // 404 means it's already gone, which is fine
            if (e.getCode() == 404) {
                log.warn("Upload record already purged from Mux.");
            } else {
                log.error("Mux API Error: {} | Body: {}", e.getCode(), e.getResponseBody());
            }
        }
    }

    private void updateLessonWithPlaybackId(String uploadId, String playbackId) {
        log.info("Linking Playback ID {} to Mux Upload ID: {}", playbackId, uploadId);
        lessonRepository.findByVideoUploadId(uploadId).ifPresentOrElse(lesson -> {
            lesson.setVideoPlaybackId(playbackId);
            lessonRepository.save(lesson);
            log.info("Successfully linked Playback ID {} to Lesson {}", playbackId, lesson.getId());
        }, () -> log.warn("No lesson found for Mux Upload ID: {}", uploadId));
    }


    public boolean processWebhook(String payload, String signatureHeader) {
        try {
            if (!isSignatureValid(payload, signatureHeader)) {
                log.error("Invalid Mux signature");
                throw new SecurityException("Invalid Mux signature");
            }

            JsonNode node = objectMapper.readTree(payload);
            String eventType = node.path("type").asString();

            if ("video.asset.ready".equals(eventType)) {
                JsonNode data = node.path("data");
                String uploadId = data.path("upload_id").asString();
                String assetId = data.path("id").asString();
                String playbackId = data.path("playback_ids").get(0).path("id").asString();

                // Check if lesson exists
                var lessonOpt = lessonRepository.findByVideoUploadId(uploadId);

                if (lessonOpt.isEmpty()) {
                    log.warn("Lesson for Upload ID {} not found yet. Signaling Mux to retry.", uploadId);
                    return false; // <--- This triggers the 404
                }

                // Update the lesson since it exists
                updateLessonData(lessonOpt.get().getVideoUploadId(), assetId, playbackId);
            }
            return true; // Return true for all other events so Mux stops sending them
        } catch (Exception e) {
            log.error("Webhook error", e);
            return false;
        }
    }


    private boolean isSignatureValid(String payload, String signatureHeader) {
        try {
            // 1. Mux Header format: t=1234567,v1=hashvalue
            String[] parts = signatureHeader.split(",");
            String timestamp = parts[0].split("=")[1];
            String receivedHash = parts[1].split("=")[1];

            // 2. Prepare the string to sign: timestamp + "." + raw body
            String signedPayload = timestamp + "." + payload;

            // 3. Create the HMAC SHA256 hash using your webhookSecret
            javax.crypto.Mac hmac = javax.crypto.Mac.getInstance("HmacSHA256");
            javax.crypto.spec.SecretKeySpec secretKey = new javax.crypto.spec.SecretKeySpec(
                    webhookSecret.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                    "HmacSHA256"
            );
            hmac.init(secretKey);

            byte[] hashBytes = hmac.doFinal(signedPayload.getBytes(java.nio.charset.StandardCharsets.UTF_8));

            // 4. Convert to Hex
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) sb.append(String.format("%02x", b));
            String expectedHash = sb.toString();

            // 5. Compare what you calculated with what Mux sent
            return java.security.MessageDigest.isEqual(
                    expectedHash.getBytes(),
                    receivedHash.getBytes()
            );
        } catch (Exception e) {
            log.error("Signature verification failed", e);
            return false;
        }
    }

    private void updateLessonData(String uploadId, String assetId, String playbackId) {
        lessonRepository.findByVideoUploadId(uploadId).ifPresent(lesson -> {
            if (!lesson.getVideoAssetId().isBlank() && !lesson.getVideoAssetId().isBlank()) {
                log.info("Lesson already has Asset ID and Playback ID");
                return; // No update needed, already has Asset ID and Playback ID
            }
            lesson.setVideoAssetId(assetId);     // Now we store the Asset ID for future deletes
            lesson.setVideoPlaybackId(playbackId); // For the Angular Player
            lessonRepository.save(lesson);
        });
    }
}

package dev.marvin.courseservice.storage.mux;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "mux_assets",
        indexes = {
                @Index(name = "idx_mux_upload_id", columnList = "uploadId")
        }
)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class MuxAsset {
    @Id
    @GeneratedValue
    private Long id;
    private String uploadId;
    private String assetId;
    private String playbackId;
    private boolean processed;
}
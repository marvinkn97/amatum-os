package dev.marvin.courseservice.storage.mux;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MuxAssetRepository extends JpaRepository<MuxAsset, Long> {
    Optional<MuxAsset> findByUploadId(String uploadId);
}

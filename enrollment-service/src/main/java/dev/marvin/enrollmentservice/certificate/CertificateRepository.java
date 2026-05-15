package dev.marvin.enrollmentservice.certificate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CertificateRepository extends JpaRepository<CertificateEntity, UUID> {

    Optional<CertificateEntity> findByEnrollmentIdAndLearnerId(UUID enrollmentId, UUID learnerId);

    Page<CertificateEntity> findByLearnerIdAndTenantId(UUID learnerId, String tenantId, Pageable pageable);
}

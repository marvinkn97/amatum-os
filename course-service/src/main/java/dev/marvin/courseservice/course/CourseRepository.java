package dev.marvin.courseservice.course;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CourseRepository extends JpaRepository<CourseEntity, UUID> {
    Page<CourseEntity> findByTenantIdAndIsDeleted(String tenantId, boolean isDeleted, Pageable pageable);

  // SEARCH ACTIVE
  @Query("SELECT c FROM CourseEntity c WHERE c.isDeleted = false AND c.tenantId = :tenantId AND (" +
          "(:name IS NULL AND :categoryId IS NULL) OR " +
          "(:name IS NOT NULL AND LOWER(c.title) LIKE LOWER(CAST(CONCAT('%', :name, '%') AS string))) OR " +
          "(:categoryId IS NOT NULL AND c.category.id = :categoryId))")
  Page<CourseEntity> findActiveByNameCategoryAndTenant(
          @Param("name") String name,
          @Param("categoryId") UUID categoryId,
          @Param("tenantId") String tenantId,
          Pageable pageable);

  // SEARCH ARCHIVED
  @Query("SELECT c FROM CourseEntity c WHERE c.isDeleted = true AND c.tenantId = :tenantId AND (" +
          "(:name IS NULL AND :categoryId IS NULL) OR " +
          "(:name IS NOT NULL AND LOWER(c.title) LIKE LOWER(CAST(CONCAT('%', :name, '%') AS string))) OR " +
          "(:categoryId IS NOT NULL AND c.category.id = :categoryId))")
  Page<CourseEntity> findArchivedByNameCategoryAndTenant(
          @Param("name") String name,
          @Param("categoryId") UUID categoryId,
          @Param("tenantId") String tenantId,
          Pageable pageable);

}

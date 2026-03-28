package dev.marvin.courseservice.category;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<CategoryEntity, UUID> {
    Page<CategoryEntity> findByNameContainingIgnoreCase(String name, Pageable pageable);

    List<CategoryEntity> findAllByIsActive(boolean isActive);
}

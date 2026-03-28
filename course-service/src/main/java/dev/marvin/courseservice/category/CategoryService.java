package dev.marvin.courseservice.category;

import dev.marvin.courseservice.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryService {
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public Page<CategoryResponse> getAllCategories(Pageable pageable) {
        return categoryRepository.findAll(pageable)
                .map(categoryEntity -> new CategoryResponse(
                        categoryEntity.getId(),
                        categoryEntity.getName(),
                        categoryEntity.getDescription(),
                        categoryEntity.isActive()));
    }


    @Transactional
    public void createCategory(CategoryRequest request) {
        CategoryEntity courseCategory = CategoryEntity.builder()
                .name(request.name())
                .description(request.description())
                .isActive(true)
                .build();

        categoryRepository.save(courseCategory);
    }

    @Transactional
    public void toggleActiveStatus(UUID id) {
        CategoryEntity category = categoryRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Category with given id [%s] not found".formatted(id)));
        category.setActive(!category.isActive());
        categoryRepository.save(category);
    }

    @Transactional
    public void updateCategory(UUID id, CategoryRequest request){
        CategoryEntity category = categoryRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Category with given id [%s] not found".formatted(id)));

        boolean changes = false;

        if(!category.getName().equals(request.name())){
            category.setName(request.name());
            changes = true;
        }

        if(!category.getDescription().equals(request.description())){
            category.setDescription(request.description());
            changes = true;
        }

        if(!changes){
            log.info("No data changes detected");
            return;
        }

        categoryRepository.save(category);
    }

    @Transactional(readOnly = true)
    public Page<CategoryResponse> searchCategoriesByName(String name, Pageable pageable) {
        return categoryRepository.findByNameContainingIgnoreCase(name, pageable)
                .map(entity -> new CategoryResponse(
                        entity.getId(),
                        entity.getName(),
                        entity.getDescription(),
                        entity.isActive()));
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllActiveCategories(){
       return categoryRepository.findAllByIsActive(true).stream()
               .map(categoryEntity -> new CategoryResponse(categoryEntity.getId(), categoryEntity.getName()))
               .toList();
    }
}

package dev.marvin.courseservice.category;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Tag(name = "Course Categories", description = "Course Categories API")
public class CategoryController {
    private final CategoryService categoryService;
    private final PagedResourcesAssembler<CategoryResponse> pagedResourcesAssembler;

    @Operation(summary = "Get all categories")
    @GetMapping("/all")
    public ResponseEntity<PagedModel<EntityModel<CategoryResponse>>> getAll(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        // 1. Get the Page from your service
        Page<CategoryResponse> categoryPage = categoryService.getAllCategories(PageRequest.of(page, size));

        // 2. Convert to PagedModel (CollectionModel) using an inline lambda
        // This adds the "self", "next", "prev" links and the "page" metadata automatically
        PagedModel<EntityModel<CategoryResponse>> pagedModel =
                pagedResourcesAssembler.toModel(categoryPage, EntityModel::of);

        return ResponseEntity.ok(pagedModel);
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Create a new category")
    @PostMapping
    public ResponseEntity<Void> create(@RequestBody CategoryRequest request) {
        categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Update a category")
    @PatchMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable UUID id, @RequestBody CategoryRequest request) {
        categoryService.updateCategory(id, request);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Toggle the status of a category")
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<Void> toggleStatus(@PathVariable UUID id) {
        categoryService.toggleActiveStatus(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Search for categories by name")
    @GetMapping("/search")
    public ResponseEntity<PagedModel<EntityModel<CategoryResponse>>> searchByName(
            @RequestParam("name") String name,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        Page<CategoryResponse> categoryPage =
                categoryService.searchCategoriesByName(name, PageRequest.of(page, size));

        return ResponseEntity.ok(pagedResourcesAssembler.toModel(categoryPage, EntityModel::of));
    }

    @Operation(summary = "Get all active categories for dropdown")
    @GetMapping("/dropdown")
    public ResponseEntity<List<CategoryResponse>> getAllActiveCategories(){
        List<CategoryResponse> categoryResponseList = categoryService.getAllActiveCategories();
        return ResponseEntity.ok(categoryResponseList);
    }
}

package dev.marvin.courseservice.course;

import dev.marvin.courseservice.module.ModuleReOrderRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@Tag(name = "Courses", description = "Courses API")
public class CourseController {
    private final CourseService courseService;
    private final PagedResourcesAssembler<CourseResponse> pagedResourcesAssembler;

    @PreAuthorize("hasAnyRole('MANAGER', 'LECTURER')")
    @Operation(summary = "Create a new course")
    @PostMapping
    public ResponseEntity<CourseResponse> create(@Valid @RequestBody CourseRequest request) {
        CourseResponse courseResponse = courseService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(courseResponse);
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'LECTURER')")
    @Operation(summary = "Update an existing course")
    @PutMapping("/{id}")
    public ResponseEntity<CourseResponse> update(@PathVariable("id") UUID courseId, @Valid @RequestBody CourseRequest request) {
        courseService.update(courseId, request);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'LECTURER')")
    @Operation(summary = "Get a course by ID")
    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> getCourseById(@PathVariable("id") UUID courseId) {
        return ResponseEntity.ok(courseService.getCourseById(courseId));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'LECTURER')")
    @Operation(summary = "Get all active courses")
    @GetMapping("/all/active")
    public ResponseEntity<PagedModel<EntityModel<CourseResponse>>> getAllActiveCourses(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        // 1. Get the Page from your service
        Page<CourseResponse> courseResponsePage = courseService.getAllActiveCourses(PageRequest.of(page, size));

        // 2. Convert to PagedModel (CollectionModel) using an inline lambda
        // This adds the "self", "next", "prev" links and the "page" metadata automatically
        PagedModel<EntityModel<CourseResponse>> pagedModel =
                pagedResourcesAssembler.toModel(courseResponsePage, EntityModel::of);

        return ResponseEntity.ok(pagedModel);
    }

    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Get all archived courses")
    @GetMapping("/all/archived")
    public ResponseEntity<PagedModel<EntityModel<CourseResponse>>> getAllArchivedCourses(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        // 1. Get the Page from your service
        Page<CourseResponse> courseResponsePage = courseService.getAllArchivedCourses(PageRequest.of(page, size));

        // 2. Convert to PagedModel (CollectionModel) using an inline lambda
        // This adds the "self", "next", "prev" links and the "page" metadata automatically
        PagedModel<EntityModel<CourseResponse>> pagedModel =
                pagedResourcesAssembler.toModel(courseResponsePage, EntityModel::of);

        return ResponseEntity.ok(pagedModel);
    }


    @PreAuthorize("hasAnyRole('MANAGER', 'LECTURER')")
    @Operation(summary = "Search for active courses by name and category")
    @GetMapping("/search/active")
    public ResponseEntity<PagedModel<EntityModel<CourseResponse>>> searchActiveCourses(
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "categoryId", required = false) UUID categoryId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        Page<CourseResponse> coursePage =
                courseService.searchActiveCourses(name, categoryId, PageRequest.of(page, size));

        return ResponseEntity.ok(pagedResourcesAssembler.toModel(coursePage, EntityModel::of));
    }

    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Search for archived courses by name and category")
    @GetMapping("/search/archived")
    public ResponseEntity<PagedModel<EntityModel<CourseResponse>>> searchArchivedCourses(
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "categoryId", required = false) UUID categoryId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        Page<CourseResponse> coursePage =
                courseService.searchArchivedCourses(name, categoryId, PageRequest.of(page, size));

        return ResponseEntity.ok(pagedResourcesAssembler.toModel(coursePage, EntityModel::of));
    }

    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Delete a course by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") UUID courseId) {
        courseService.delete(courseId);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Restore a course by ID")
    @PatchMapping("/{id}/restore")
    public ResponseEntity<Void> restore(@PathVariable("id") UUID courseId) {
        courseService.restore(courseId);
        return ResponseEntity.ok().build();
    }


    @PreAuthorize("hasAnyRole('MANAGER', 'LECTURER')")
    @Operation(summary = "Reorder modules in a course")
    @PutMapping("/{id}/reorder-modules")
    public ResponseEntity<Void> reOrderModuleSequence(@Parameter @PathVariable("id") UUID courseId, @Valid @RequestBody List<ModuleReOrderRequest> moduleReOrderRequests) {
        courseService.reOrderModuleSequence(courseId, moduleReOrderRequests);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'LECTURER')")
    @Operation(summary = "Publish a course")
    @PatchMapping("/{id}/publish")
    public ResponseEntity<CourseResponse> publish(@Parameter @PathVariable("id") UUID courseId) {
        CourseResponse courseResponse = courseService.publishCourse(courseId);
        return ResponseEntity.ok(courseResponse);
    }

    @PreAuthorize("hasRole('LEARNER')")
    @Operation(summary = "Get course catalog for learners (Marketplace + Organization courses)")
    @GetMapping("/catalog")
    public ResponseEntity<PagedModel<EntityModel<CourseResponse>>> getLearnerCatalog(
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "categoryId", required = false) UUID categoryId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        Page<CourseResponse> coursePage =
                courseService.getLearnerCatalog(name, categoryId, PageRequest.of(page, size));

        return ResponseEntity.ok(pagedResourcesAssembler.toModel(coursePage, EntityModel::of));
    }

    @PreAuthorize("hasRole('LEARNER')")
    @Operation(summary = "Get learner course view")
    @GetMapping("/{id}/learner")
    public ResponseEntity<CourseResponse> getLearnerCourseView(@PathVariable("id") UUID courseId) {
        return ResponseEntity.ok(courseService.getLearnerCourseView(courseId));
    }


}

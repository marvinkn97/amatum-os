package dev.marvin.courseservice.module;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/modules")
@RequiredArgsConstructor
@Tag(name = "Course Modules", description = "Course Modules API")
public class ModuleController {
    private final ModuleService moduleService;

    @Operation(summary = "Create a new course module")
    @PostMapping
    public ResponseEntity<ModuleResponse> create(@Valid @RequestBody ModuleRequest request) {
        ModuleResponse moduleResponse = moduleService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(moduleResponse);
    }
}

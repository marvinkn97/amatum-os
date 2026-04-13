package dev.marvin.courseservice.module;

import dev.marvin.courseservice.learningstep.LearningStepReorderRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/modules")
@RequiredArgsConstructor
@Tag(name = "Course Modules", description = "Course Modules API")
@Slf4j
public class ModuleController {
    private final ModuleService moduleService;

    @Operation(summary = "Create a new course module")
    @PostMapping
    public ResponseEntity<ModuleResponse> create(@Valid @RequestBody ModuleRequest request) {
        log.info("Received module request: {}", request.toString());
        ModuleResponse moduleResponse = moduleService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(moduleResponse);
    }

    @Operation(summary = "Reorder learning steps in a module")
    @PutMapping("/{id}/reorder-steps")
    public ResponseEntity<Void> reOrderLearningStepSequence(@Parameter @PathVariable("id") UUID module, @Valid @RequestBody List<LearningStepReorderRequest> learningStepReorderRequestList) {
        log.info("Received learning step reorder request for module {}", module);
        moduleService.reOrderLearningStepSequence(module, learningStepReorderRequestList);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Update module details")
    @PatchMapping("/{id}")
    public ResponseEntity<ModuleResponse> updateModuleDetails(@Parameter @PathVariable("id") UUID moduleId, @Valid @RequestBody ModuleDetailsUpdateRequest request) {
        ModuleResponse moduleResponse = moduleService.updateModuleDetails(moduleId, request);
        return ResponseEntity.ok(moduleResponse);
    }

    @Operation(summary = "Publish a module")
    @PatchMapping("/{id}/publish")
    public ResponseEntity<ModuleResponse> publishModule(@Parameter @PathVariable("id") UUID moduleId) {
        ModuleResponse moduleResponse = moduleService.publishModule(moduleId);
        return ResponseEntity.ok(moduleResponse);
    }

    @Operation(summary = "Delete a module")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteModule(@Parameter @PathVariable("id") UUID moduleId) {
        moduleService.deleteModule(moduleId);
        return ResponseEntity.ok().build();
    }

}

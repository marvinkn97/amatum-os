package dev.marvin.courseservice.learningstep;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;


@RestController
@RequestMapping("/api/learning-steps")
@RequiredArgsConstructor
@Tag(name = "Learning Step", description = "Learning Steps API")
@Slf4j
public class LearningStepController {
    private final LearningStepService learningStepService;

    @Operation(summary = "Create a new learning step")
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<LearningStepResponse> create(@Valid @ModelAttribute LearningStepRequest request){
        log.info("Received learning step request: {}", request.toString());
        LearningStepResponse learningStepResponse = learningStepService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(learningStepResponse);
    }


    @Operation(summary = "Update a learning step")
    @PutMapping("/{id}")
    public ResponseEntity<LearningStepResponse> update(@Parameter @PathVariable("id") UUID learningStepId, @Valid @ModelAttribute LearningStepUpdateRequest request){
        log.info("Received learning step update request: {}", request.toString());
        LearningStepResponse learningStepResponse = learningStepService.update(learningStepId, request);
        return ResponseEntity.ok(learningStepResponse);
    }

    @Operation(summary = "Delete a learning step")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        log.info("Received request to delete learning step: {}", id);
        learningStepService.delete(id);
        return ResponseEntity.ok().build();
    }

}

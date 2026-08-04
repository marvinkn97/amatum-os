package dev.marvin.talemaiservice;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/talemai")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Talemai", description = "Talemai API")
public class TalemaiController {
    private final TalemaiService talemaiService;

    @PostMapping("/ask")
    public String askTalemai(@Valid @RequestBody String question) {
       return talemaiService.sampleCall(question);
    }
}

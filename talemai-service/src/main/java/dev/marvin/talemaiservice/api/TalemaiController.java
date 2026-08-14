package dev.marvin.talemaiservice.api;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/talemai")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Talemai", description = "Talemai API")
public class TalemaiController {
    private final TalemaiService talemaiService;

    @PostMapping(value = "/ask", produces = MediaType.APPLICATION_NDJSON_VALUE)
    public Flux<String> askTalemai(@Valid @RequestBody TalemaiRequest request) {
       return talemaiService.sampleCall(request);
    }
}

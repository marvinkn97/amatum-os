package dev.marvin.talemaiservice.configuration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.boot.ApplicationRunner;
import org.springframework.cloud.function.context.FunctionCatalog;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ByteArrayResource;
import reactor.core.publisher.Flux;
import reactor.core.scheduler.Schedulers;

import java.util.List;
import java.util.function.Consumer;
import java.util.function.Function;

@Configuration
@Slf4j
public class IngestionPipelineConfiguration {
    @Bean
    Function<Flux<byte[]>, Flux<Document>> documentReader() {
        return resourceFlux -> resourceFlux
                .map(fileBytes ->
                        new TikaDocumentReader(
                                new ByteArrayResource(fileBytes))
                                .get()
                                .getFirst()).subscribeOn(Schedulers.boundedElastic());
    }

    @Bean
    Function<Flux<Document>, Flux<List<Document>>> splitter() {
        var splitter = TokenTextSplitter.builder().build();
        return documentFlux ->
                documentFlux
                        .map(incoming -> splitter
                                .apply(List.of(incoming)))
                        .subscribeOn(Schedulers.boundedElastic());
    }

    @Bean
    Consumer<Flux<List<Document>>> vectorStoreConsumer(VectorStore vectorStore) {
        return documentFlux ->
                documentFlux
                        .doOnNext(documents -> {
                            if (!documents.isEmpty()) {
                                log.info("Writing {} documents to vector store.", documents.size());
                                vectorStore.accept(documents);
                            }
                        })
                        .doOnComplete(() ->
                                log.info("Vector store ingestion completed."))
                        .doOnError(error ->
                                log.error("Vector store ingestion failed.", error))
                        .subscribe();
    }

    @Bean
    ApplicationRunner go(FunctionCatalog catalog) {
        Runnable composedFunction = catalog.lookup(null);
        return _ -> composedFunction.run();
    }
}

package dev.marvin.talemaiservice.ai.rag;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.rag.Query;
import org.springframework.ai.rag.retrieval.search.DocumentRetriever;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Slf4j
public class WebSearchDocumentRetriever implements DocumentRetriever {


    @Override
    public List<Document> retrieve(Query query) {
        return List.of();
    }
}
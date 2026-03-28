package dev.marvin.courseservice.category;

import java.util.UUID;

public record CategoryResponse(UUID id, String name, String description, Boolean isActive) {

    public CategoryResponse(UUID id, String name) {
        this(id, name, null, null); // delegate to canonical constructor
    }

}

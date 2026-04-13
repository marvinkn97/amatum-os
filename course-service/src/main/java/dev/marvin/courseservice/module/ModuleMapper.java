package dev.marvin.courseservice.module;

public class ModuleMapper {
    private ModuleMapper() {
    }

    public static ModuleResponse mapToResponse(ModuleEntity moduleEntity) {
        return new ModuleResponse(moduleEntity.getId(), moduleEntity.getTitle(), moduleEntity.getSequence(), moduleEntity.getStatus());
    }

}

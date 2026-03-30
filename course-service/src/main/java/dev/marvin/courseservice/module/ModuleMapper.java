package dev.marvin.courseservice.module;

import dev.marvin.courseservice.learningstep.LearningStepResponse;

import java.util.List;

public class ModuleMapper {
    private ModuleMapper(){}

    public static ModuleResponse mapToResponse(ModuleEntity moduleEntity){
        return new ModuleResponse(moduleEntity.getId(), moduleEntity.getTitle(), moduleEntity.getSequence());
    }

    public static ModuleResponse mapToResponse(ModuleEntity moduleEntity, List<LearningStepResponse> learningStepResponseList){
        return new ModuleResponse(moduleEntity.getId(), moduleEntity.getTitle(), moduleEntity.getSequence(), learningStepResponseList);
    }
}

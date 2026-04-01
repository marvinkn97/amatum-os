package dev.marvin.courseservice.module;

import dev.marvin.courseservice.course.CourseEntity;
import dev.marvin.courseservice.course.CourseRepository;
import dev.marvin.courseservice.exception.BadRequestException;
import dev.marvin.courseservice.exception.ResourceNotFoundException;
import dev.marvin.courseservice.learningstep.LearningStepEntity;
import dev.marvin.courseservice.learningstep.LearningStepReorderRequest;
import dev.marvin.courseservice.learningstep.LearningStepRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ModuleService {
    private final ModuleRepository moduleRepository;
    private final CourseRepository courseRepository;
    private final LearningStepRepository learningStepRepository;

    @Transactional
    public ModuleResponse create(ModuleRequest request) {
        CourseEntity course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> new BadRequestException("Course with id [%s] is invalid".formatted(request.courseId())));

        ModuleEntity moduleEntity = ModuleEntity.builder()
                .sequence(request.sequence())
                .title(request.title())
                .course(course)
                .build();

        moduleEntity = moduleRepository.save(moduleEntity);
        return ModuleMapper.mapToResponse(moduleEntity);
    }


    @Transactional
    public void reOrderLearningStepSequence(UUID moduleId, List<LearningStepReorderRequest> learningStepReorderRequestList) {
        log.info("Re-ordering learning steps for module {}", moduleId);
        ModuleEntity moduleEntity = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module with id [%s] not found".formatted(moduleId)));

        List<LearningStepEntity> learningStepEntities = learningStepRepository.findByModule_Id(moduleEntity.getId());

        Map<UUID, Integer> sequenceMap = learningStepReorderRequestList.stream()
                .collect(Collectors.toMap(LearningStepReorderRequest::learningStepId, LearningStepReorderRequest::sequence));

        learningStepEntities.forEach(learningStep -> {
            Integer newSequence = sequenceMap.get(learningStep.getId());
            if (newSequence != null) {
                learningStep.setSequence(newSequence);
            }
        });

        learningStepRepository.saveAll(learningStepEntities);

        log.info("Successfully re-ordered {} modules for course {}", learningStepEntities.size(), moduleId);

    }

    @Transactional
    public ModuleResponse updateModuleDetails(UUID moduleId, ModuleDetailsUpdateRequest request) {
        log.info("Updating module with id: {}", moduleId);
        ModuleEntity moduleEntity = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module with id [%s] not found".formatted(moduleId)));
        boolean changes = false;

        if(moduleEntity.getTitle() != null && !moduleEntity.getTitle().equals(request.title())){
            log.info("Updating title of module {} from [{}] to [{}]", moduleId, moduleEntity.getTitle(), request.title());
            moduleEntity.setTitle(request.title());
            changes = true;
        }

        if(!changes){
            log.info("No changes detected for module {}", moduleId);
        }

        moduleRepository.save(moduleEntity);
        return ModuleMapper.mapToResponse(moduleEntity);
    }

}

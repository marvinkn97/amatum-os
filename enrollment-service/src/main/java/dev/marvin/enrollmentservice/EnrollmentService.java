package dev.marvin.enrollmentservice;

import dev.marvin.enrollmentservice.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EnrollmentService {
    private final EnrollmentRepository enrollmentRepository;

    @Transactional
    public EnrollmentResponse enroll(EnrollmentRequest enrollmentRequest, Authentication authentication){
        UUID learnerId = UUID.fromString(authentication.getName());
        UUID courseId = enrollmentRequest.courseId();
        log.info("Enrolling learner {} for course {}", learnerId, courseId);

        if(enrollmentRepository.existsByLearnerIdAndCourseId(learnerId, courseId)){
            log.info("Learner {} already enrolled in course {}", learnerId, courseId);
            throw new BadRequestException("Learner already enrolled in course");
        }

        EnrollmentEntity enrollmentEntity = EnrollmentEntity.builder()
                .courseId(courseId)
                .userId(UUID.fromString(learnerId))
                .status(EnrollmentStatus.ENROLLED)
                .startTime(Instant.now())
                .build();

        EnrollmentEntity savedEnrollment = enrollmentRepository.save(enrollmentEntity);

        return EnrollmentMapper.mapToResponse(savedEnrollment);
    }


}

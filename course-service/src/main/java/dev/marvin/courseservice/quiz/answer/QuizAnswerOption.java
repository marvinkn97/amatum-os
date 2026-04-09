package dev.marvin.courseservice.quiz.answer;

import dev.marvin.courseservice.quiz.question.QuizQuestion;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;


@Entity
@Table(name = "quiz_answer_options",
        indexes = {
        @Index(name = "idx_quiz_option_question_id", columnList = "quiz_question_id")
})
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class QuizAnswerOption {
    @Id
    @GeneratedValue
    private UUID id;

    @Version
    private Long version;

    @Column(columnDefinition = "TEXT")
    private String answerText;

    private boolean isCorrect;

    @ManyToOne
    @JoinColumn(name = "quiz_question_id")
    private QuizQuestion quizQuestion;

    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

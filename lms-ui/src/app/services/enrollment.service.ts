import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CourseResponse } from './course.service';

export interface EnrollmentRequest {
  courseId: string;
  // Add other fields required by your backend's EnrollmentRequest DTO
}

export interface EnrollmentResponse {
  id: string;
  status: 'ACIVE' | 'COMPLETED';
  isCompleted: boolean;
  progress: number;
  lastLearningStepId: string | null;
  lastActivityAt: string; // ISO date string
  course: CourseResponse;
}

export interface QuizAttemptRequest {
  quizId: string;
  selectedAnswers: QuizAttemptAnswerRequest[];
}

export interface QuizAttemptAnswerRequest {
  questionId: string; 
  selectedAnswerIds: string[];
}

export interface QuizAttemptAnswerResponse {
  questionText: string;
  selectedOptions: string[];
  correctOptions: string[];
  isCorrect: boolean;
}

export interface QuizAttemptResponse {
  id: string;
  totalQuestions: number;
  correctCount: number;
  score: number;
  passed: boolean;
  evaluatedAnswers: QuizAttemptAnswerResponse[]; // Added this
}

@Injectable({
  providedIn: 'root',
})
export class EnrollmentService {
  updateProgress(arg0: {
    learningStepId: string;
    completed: boolean;
    timeSpentSeconds: number;
  }): Observable<unknown> {
    throw new Error('Method not implemented.');
  }
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8083/api/enrollments';

  enroll(request: EnrollmentRequest): Observable<EnrollmentResponse> {
    return this.http.post<EnrollmentResponse>(this.API_URL, request);
  }

  getActiveEnrollments(page: number, size: number): Observable<EnrollmentResponse> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<EnrollmentResponse>(`${this.API_URL}/active`, { params });
  }

  getCompletedEnrollments(page: number, size: number): Observable<EnrollmentResponse> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<EnrollmentResponse>(`${this.API_URL}/completed`, { params });
  }

  getEnrollmentById(id: string): Observable<EnrollmentResponse> {
    return this.http.get<EnrollmentResponse>(`${this.API_URL}/${id}`);
  }

  markStepComplete(enrollmentId: string, stepId: string): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${enrollmentId}/steps/${stepId}/complete`, {});
  }

  submitQuiz(enrollmentId: string, stepId: string, request: QuizAttemptRequest): Observable<QuizAttemptResponse> {
  const url = `${this.API_URL}/${enrollmentId}/steps/${stepId}/submit`;
  return this.http.post<QuizAttemptResponse>(url, request);
}
}

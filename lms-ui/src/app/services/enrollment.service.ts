import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  course: CourseDto;
}

export interface CourseDto {
  id: string;
  title: string;
  slug: string;
  description: string;
  modules: ModuleDto[];
}

export interface ModuleDto {
  id: string;
  title: string;
  sequence: number;
  learningSteps: LearningStepDto[];
}

export interface LearningStepDto {
  id: string;
  title: string;
  type: 'LESSON' | 'QUIZ';
  sequence: number;

  videoEnabled: boolean;
  contentEnabled: boolean;
  materialsEnabled: boolean;

  content?: string;
  videoPlaybackId?: string;

  resources?: ResourceDto[];
  quiz?: QuizDto;

  isCompleted: boolean; // Indicates if the learner has completed this step
}

export interface ResourceDto {
  id: string;
  name: string;
  s3PreSignedUrl: string;
  contentType: string;
  size: number;
}

export interface QuizDto {
  id: string;
  questions: QuestionDto[];
}

export interface QuestionDto {
  id: string;
  questionText: string;
  hasMultipleCorrectAnswers: boolean;
  answers: AnswerDto[];
}

export interface AnswerDto {
  id: string;
  answerText: string;
  isCorrect: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class EnrollmentService {
  updateProgress(arg0: { learningStepId: string; completed: boolean; timeSpentSeconds: number; }): Observable<unknown> {
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

 markStepComplete(id: string): Observable<any> {
    throw new Error('Method not implemented.');
  }
}

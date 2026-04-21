import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EnrollmentRequest {
  courseId: string;
  // Add other fields required by your backend's EnrollmentRequest DTO
}

export interface EnrollmentResponse {
  id: string;
  status: 'ENROLLED' | 'COMPLETED';
  isCompleted: boolean;
  progress: number;
}

@Injectable({
  providedIn: 'root',
})
export class EnrollmentService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8083/api/enrollments';

  enroll(request: EnrollmentRequest): Observable<EnrollmentResponse> {
    return this.http.post<EnrollmentResponse>(this.API_URL, request);
  }
}

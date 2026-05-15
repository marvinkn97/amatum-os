import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RatingRequest {
  enrollmentId: string;
  courseId: string;
  rating: number;
  comment: string;
}

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private http = inject(HttpClient); 
   private readonly API_URL = 'http://localhost:8084/api/ratings';

  submitRating(request: RatingRequest): Observable<void> {
    return this.http.post<void>(this.API_URL, request);
  }
}
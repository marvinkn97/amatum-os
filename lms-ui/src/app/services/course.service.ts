import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ModuleResponse } from './module.service';

export interface PagedResponse<T> {
  _embedded?: {
    courseResponseList: T[]; // Name matches your Response DTO list
  };
  _links: {
    self: { href: string };
    next?: { href: string };
    prev?: { href: string };
    first?: { href: string };
    last?: { href: string };
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

export interface CourseRequest {
  title: string;
  slug: string;
  accessTier: 'FREE' | 'PREMIUM';
  isPublic: boolean;
  price: number;
  description: string;
  categoryId: string;
  tags: string[];
}

export interface ModuleReOrderRequest {
  moduleId: string;
  sequence: number;
}

export interface CourseResponse {
  id: string; // UUIDs are handled as strings in JS/TS
  title: string;
  slug: string;
  description: string;
  tags: string[]; // Set<String> maps to string[]
  isPublic: boolean;
  accessTier: 'FREE' | 'PREMIUM'; // Using a union type for your Enum
  price: number; // BigDecimal maps to number
  categoryId: string; // UUID
  status: 'DRAFT' | 'PUBLISHED'; // Matches your CourseStatus enum
  tenantId: string;
  modules: ModuleResponse[];
  isReadyToPublish: boolean; // New field to indicate if the course is ready to publish
  moduleCount: number;
  learningStepCount: number;
  isEnrolled: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8082/api/courses';

  // State Management
  courses = signal<CourseResponse[]>([]);
  pagination = signal<PagedResponse<CourseResponse>['page'] | null>(null);

  createCourse(request: CourseRequest): Observable<CourseResponse> {
    return this.http.post<CourseResponse>(this.API_URL, request);
  }

  updateCourse(id: string, request: CourseRequest): Observable<CourseResponse> {
    return this.http.put<CourseResponse>(`${this.API_URL}/${id}`, request);
  }

  getCourseById(id: string): Observable<CourseResponse> {
    return this.http.get<CourseResponse>(`${this.API_URL}/${id}`);
  }

  deleteCourse(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  restoreCourse(id: string): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${id}/restore`, {});
  }

  fetchCourses(
    view: 'active' | 'archived',
    search: string = '',
    categoryId: string = '', // Default to empty string
    page: number = 0,
    size: number = 9,
  ): Observable<PagedResponse<CourseResponse>> {
    const endpoint =
      view === 'active' ? `${this.API_URL}/search/active` : `${this.API_URL}/search/archived`;

    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    if (search && search.trim() !== '') {
      params = params.set('name', search);
    }

    // Only append if it's a real value (not empty, not 'All' placeholder)
    if (categoryId && categoryId.trim() !== '' && categoryId !== 'All') {
      params = params.set('categoryId', categoryId);
    }

    return this.http.get<PagedResponse<CourseResponse>>(endpoint, { params });
  }

  reorderModuleSequence(courseId: string, requests: ModuleReOrderRequest[]): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${courseId}/reorder-modules`, requests);
  }

  publishCourse(courseId: string): Observable<CourseResponse> {
    return this.http.patch<CourseResponse>(`${this.API_URL}/${courseId}/publish`, {});
  }

  // Add to CourseService class
  fetchCatalog(
    search: string = '',
    categoryId: string = '',
    page: number = 0,
    size: number = 9,
  ): Observable<PagedResponse<CourseResponse>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    if (search?.trim()) params = params.set('name', search);
    if (categoryId?.trim()) params = params.set('categoryId', categoryId);

    return this.http.get<PagedResponse<CourseResponse>>(`${this.API_URL}/catalog`, { params });
  }


   getLearnerCourseView(id: string): Observable<CourseResponse> {
    return this.http.get<CourseResponse>(`${this.API_URL}/${id}/learner`);
  }
}

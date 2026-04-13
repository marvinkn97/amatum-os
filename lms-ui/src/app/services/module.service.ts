import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LearningStepResponse } from './learning-step.service';

export interface PagedResponse<T> {
  _embedded?: {
    moduleResponseList: T[]; // Name matches your Response DTO list
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

export interface ModuleRequest {
  courseId: string;
  sequence: number;
  title: string;
}

export interface ModuleDetailsUpdate {
  title: string;
}

export interface ModuleResponse {
  id: string;
  sequence: number;
  title: string;
  status: 'DRAFT' | 'PUBLISHED';
  isReadyToPublish: boolean;
  learningSteps: LearningStepResponse[];
}

export interface LearningStepReorderRequest {
  learningStepId: string;
  sequence: number;
}

@Injectable({
  providedIn: 'root',
})
export class ModuleService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8082/api/modules';

  createModule(request: ModuleRequest): Observable<ModuleResponse> {
    return this.http.post<ModuleResponse>(this.API_URL, request);
  }

  updateModuleDetails(moduleId: string, payload: ModuleDetailsUpdate): Observable<ModuleResponse> {
    return this.http.patch<any>(`${this.API_URL}/${moduleId}`, payload);
  }

  reOrderStepSequence(moduleId: string, payload: LearningStepReorderRequest[]): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${moduleId}/reorder-steps`, payload);
  }

  publishModule(moduleId: string): Observable<ModuleResponse> {
    return this.http.patch<ModuleResponse>(`${this.API_URL}/${moduleId}/publish`, {});
  }

  deleteModule(moduleId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${moduleId}`);
  }
}



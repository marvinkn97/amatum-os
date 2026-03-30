import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PagedResponse<T> {
  _embedded?: {
    lessonResponseList: T[]; // Name matches your Response DTO list
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

export interface LearningStepResponse {
  id: string;
  title: string;
  sequence: number;
  type: 'LESSON' | 'QUIZ';
  content?: string;
  moduleId: string;

  vidoeEnabled?: boolean;
  contentEnabled?: boolean;
  materialsEnabled?: boolean;

  lesson: any; // Placeholder for lesson-specific data
  quiz: any; // Placeholder for quiz-specific data
}

export interface LearningStepRequest {
  moduleId: string; // The UUID from your Module
  title: string;
  sequence: number;
  content: string;
  type: 'LESSON' | 'QUIZ'; // Matches LessonType enum
  resources?: LearningStepResourceRequest[];

  videoEnabled?: boolean;
  contentEnabled?: boolean;
  materialsEnabled?: boolean;

  videoUploadId?: string | null;
  questions?: [];
}

export interface LearningStepResourceRequest {
  name: string; // "Chapter 1 Notes"
  objectKey: string; // "materials/uuid-notes.pdf"
  contentType: string; // "application/pdf"
  size: number; // 1024576 (in bytes)
}

@Injectable({
  providedIn: 'root',
})
export class LearningStepService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8082/api/learning-steps';

  createLearningStep(request: LearningStepRequest): Observable<LearningStepResponse> {
    const formData = new FormData();

    // Append basic fields
    formData.append('moduleId', request.moduleId);
    formData.append('title', request.title);
    formData.append('sequence', request.sequence.toString());
    formData.append('content', request.content);
    formData.append('type', request.type);

    if (request.type === 'LESSON') {
      formData.append('videoEnabled', request.videoEnabled ? 'true' : 'false');
      formData.append('contentEnabled', request.contentEnabled ? 'true' : 'false');
      formData.append('materialsEnabled', request.materialsEnabled ? 'true' : 'false');
      formData.append('videoUploadId', request.videoUploadId ?? '');
    }

    if (request.type === 'QUIZ') {
      formData.append('questions', JSON.stringify(request.questions ?? []));
    }

    // Append Attachments
    if (request.resources) {
      request.resources.forEach((resource, index) => {
        // Append the metadata
        formData.append(`resources[${index}].name`, resource.name);
        formData.append(`resources[${index}].objectKey`, resource.objectKey);
        formData.append(`resources[${index}].contentType`, resource.contentType);
        formData.append(`resources[${index}].size`, resource.size.toString());
      });
    }

    let totalSize = 0;
formData.forEach((value, key) => {
  if (typeof value === 'string') {
    totalSize += new Blob([value]).size;
  } else if (value instanceof File) {
    totalSize += value.size;
  }
});
console.log('Total FormData size (bytes):', totalSize);

    return this.http.post<LearningStepResponse>(this.API_URL, formData);
  }
}

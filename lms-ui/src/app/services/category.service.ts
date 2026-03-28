import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface CourseCategory {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface CourseCategoryResponse {
  id: string;
  name: string;
}

export interface PagedResponse<T> {
  _embedded?: {
    categoryResponseList: T[]; // Name matches your Response DTO list
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

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8082/api/categories';

  // Signals for state management
  categories = signal<CourseCategory[]>([]);
  pagination = signal<PagedResponse<CourseCategory>['page'] | null>(null);

  /**
   * Fetch all categories with HATEOAS pagination
   */
  getAllCategories(page: number = 0, size: number = 10): Observable<PagedResponse<CourseCategory>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    return this.http.get<PagedResponse<CourseCategory>>(`${this.API_URL}/all`, { params }).pipe(
      tap((response) => {
        // Extract the list from the _embedded object
        const list = response._embedded?.categoryResponseList || [];
        this.categories.set(list);
        this.pagination.set(response.page);
      }),
    );
  }

  /**
   * Create a new category
   */
  createCategory(request: { name: string; description: string }): Observable<void> {
    return this.http.post<void>(this.API_URL, request);
  }

  /**
   * Update an existing category using PATCH
   */
  updateCategory(id: string, request: { name: string; description: string }): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${id}`, request);
  }

  /**
   * Toggle active/inactive status
   */
  toggleStatus(id: string): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${id}/toggle-status`, {});
  }

  searchCategories(
    name: string,
    page: number = 0,
    size: number = 10,
  ): Observable<PagedResponse<CourseCategory>> {
    const params = new HttpParams()
      .set('name', name)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PagedResponse<CourseCategory>>(`${this.API_URL}/search`, { params }).pipe(
      tap((response) => {
        const list = response._embedded?.categoryResponseList || [];
        this.categories.set(list);
        this.pagination.set(response.page);
      }),
    );
  }

  getAllActiveCategories(): Observable<CourseCategoryResponse[]> {
    return this.http.get<CourseCategoryResponse[]>(`${this.API_URL}/dropdown`);
  }

}

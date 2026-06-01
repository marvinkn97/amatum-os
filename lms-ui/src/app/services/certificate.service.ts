import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CertificateResponse {
  serialNumber: string;
  title: string;
  certificateUrl: string;
  issuedAt: string;
}

/** 
 * Matches your Spring Boot PagedResourcesAssembler output.
 * Wrapped in _embedded to satisfy HATEOAS standards.
 */
export interface PagedCertificateResponse {
  _embedded?: {
    certificateResponseList: CertificateResponse[];
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
export class CertificateService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl + 'certificates';

  getLearnerCertificates(page: number = 0, size: number = 10): Observable<PagedCertificateResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PagedCertificateResponse>(`${this.API_URL}/me`, { params });
  }
}
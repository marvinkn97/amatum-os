// src/app/services/identity.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface OrganizationRequest {
  name: string;
  slug: string;
  domain: string;
}

interface IdentityResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isOnboarded: boolean;
}

interface NameUpdateRequest {
  firstName: string;
  lastName: string;
}

interface PasswordUpdateRequest {
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class IdentityService {
  private http = inject(HttpClient);

  private BASE_URL = environment.apiUrl + '/identity'; // adjust if your Spring Boot port is different

  onboardLearner(): Observable<string> {
    return this.http.post(
      `${this.BASE_URL}/onboard/learner`,
      {},
      {
        responseType: 'text', // Tell Angular NOT to parse the empty body as JSON
      },
    );
  }

  onboardManager(organizationRequest: OrganizationRequest): Observable<void> {
    return this.http.post<void>(`${this.BASE_URL}/onboard/manager`, organizationRequest);
  }

  getUserProfile(): Observable<IdentityResponse> {
    return this.http.get<IdentityResponse>(`${this.BASE_URL}/me`);
  }

  updateName(request: NameUpdateRequest): Observable<void> {
    return this.http.patch<void>(`${this.BASE_URL}/me/name`, request);
  }

  updatePassword(request: PasswordUpdateRequest): Observable<void> {
    return this.http.patch<void>(`${this.BASE_URL}/me/password`, request);
  }
}

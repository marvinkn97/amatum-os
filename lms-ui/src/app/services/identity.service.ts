// src/app/services/identity.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface OrganizationRequest {
  name: string;
  slug: string;
  domain: string;
}

export interface IdentityResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isOnboarded: boolean;
  joinDate: string;
}

interface NameUpdateRequest {
  firstName: string;
  lastName: string;
}

interface PasswordUpdateRequest {
  password: string;
}

export interface PagedResponse<IdentityResponse> {
  _embedded: {
    identityResponseList: IdentityResponse[]; // Spring Data HATEOAS typically uses the class name + 'List'
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

export interface OrganizationInvitationResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: 'PENDING' | 'EXPIRED'; // Using a union type for better type safety
}

export interface OrganizationInvitationRequest {
  email: string;
  firstName: string;
  lastName: string;
}

@Injectable({
  providedIn: 'root',
})
export class IdentityService {
  private readonly http = inject(HttpClient);
  private readonly BASE_URL = environment.apiUrl + 'identity';

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

  getOrganizationMembers(
    page: number = 0,
    size: number = 10,
  ): Observable<PagedResponse<IdentityResponse>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    return this.http.get<PagedResponse<IdentityResponse>>(`${this.BASE_URL}/organization/members`, {
      params,
    });
  }

  // Get all invitations
  getOrganizationInvitations(): Observable<OrganizationInvitationResponse[]> {
    return this.http.get<OrganizationInvitationResponse[]>(
      `${this.BASE_URL}/organization/invitations`,
    );
  }

  // Invite a new member
  inviteMember(request: OrganizationInvitationRequest): Observable<void> {
    return this.http.post<void>(`${this.BASE_URL}/organization/invitations`, request);
  }
}

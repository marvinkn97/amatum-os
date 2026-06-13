import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import Keycloak from 'keycloak-js';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private http = inject(HttpClient);
  private keycloak = inject(Keycloak);

  public isAuthenticated = signal<boolean>(false);
  public isLoading = signal<boolean>(true);
  public userRoles = signal<string[]>([]);
  public isOnboarded = signal<boolean>(false);
  public user = signal<any>(null);
  public availableRoles = signal<string[]>([]);

  public isSuperAdmin = computed(() => this.userRoles().includes('SUPER_ADMIN'));
  public isManager = computed(() => this.userRoles().includes('MANAGER'));
  public isLearner = computed(() => this.userRoles().includes('LEARNER'));

  constructor() {
    this.initAuth();
  }

  private async initAuth() {
    try {
      const restored = this.restoreTokenFromStorage();

      if (restored) {
        this.loadUserData();
        this.isAuthenticated.set(true);
      } else {
        const authenticated = this.keycloak.authenticated || false;
        if (authenticated) {
          await this.refreshToken();
          this.loadUserData();
          this.isAuthenticated.set(true);
        }
      }
    } catch (error) {
      console.error('Auth init failed', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private restoreTokenFromStorage(): boolean {
    const storedToken = sessionStorage.getItem('keycloak_token');
    const storedRefreshToken = sessionStorage.getItem('keycloak_refresh_token');
    const storedTokenParsed = sessionStorage.getItem('keycloak_token_parsed');
    const storedIdToken = sessionStorage.getItem('keycloak_id_token');

    if (storedToken && storedRefreshToken) {
      // Restore tokens onto the Keycloak instance
      (this.keycloak as any).token = storedToken;
      (this.keycloak as any).refreshToken = storedRefreshToken;
      (this.keycloak as any).tokenParsed = storedTokenParsed ? JSON.parse(storedTokenParsed) : null;
      (this.keycloak as any).idToken = storedIdToken;
      (this.keycloak as any).authenticated = true;
      return true;
    }

    return false;
  }

  private persistTokenToStorage(): void {
    if (this.keycloak.token) {
      sessionStorage.setItem('keycloak_token', this.keycloak.token);
    }
    if (this.keycloak.refreshToken) {
      sessionStorage.setItem('keycloak_refresh_token', this.keycloak.refreshToken);
    }
    if (this.keycloak.tokenParsed) {
      sessionStorage.setItem('keycloak_token_parsed', JSON.stringify(this.keycloak.tokenParsed));
    }
    if (this.keycloak.idToken) {
      sessionStorage.setItem('keycloak_id_token', this.keycloak.idToken);
    }
  }

  private clearTokenFromStorage(): void {
    sessionStorage.removeItem('keycloak_token');
    sessionStorage.removeItem('keycloak_refresh_token');
    sessionStorage.removeItem('keycloak_token_parsed');
    sessionStorage.removeItem('keycloak_id_token');
  }

  async refreshToken(): Promise<boolean> {
    try {
      await this.keycloak.updateToken(30);
      this.persistTokenToStorage(); // Update stored token after refresh
      return true;
    } catch (error) {
      console.error('Token refresh failed', error);
      return false;
    }
  }

  private loadUserData() {
    const tokenParsed = this.keycloak.tokenParsed as any;

    this.user.set(tokenParsed);
    this.isAuthenticated.set(this.keycloak.authenticated || false);
    this.isOnboarded.set(
      tokenParsed?.amatum_onboarded === true || tokenParsed?.amatum_onboarded === 'true',
    );

    const clientRoles: string[] = tokenParsed?.resource_access?.['lms-ui']?.roles || [];
    const realmRoles: string[] = tokenParsed?.realm_access?.roles || [];
    const allRoles = [...clientRoles, ...realmRoles];
    this.userRoles.set(allRoles);

    const available: string[] = [];
    const isSuperAdmin = allRoles.includes('SUPER_ADMIN');
    if (isSuperAdmin) available.push('super-admin');
    if (clientRoles.includes('MANAGER')) available.push('manager');
    if (clientRoles.includes('LEARNER')) available.push('learner');
    this.availableRoles.set(available);
  }

  async handleAuthCallback(targetRedirect: string | null): Promise<void> {
    await this.refreshToken();
    this.persistTokenToStorage();
    this.loadUserData();

    if (targetRedirect && targetRedirect !== '/auth/callback') {
      await this.router.navigateByUrl(targetRedirect);
      return;
    }

    if (!this.isOnboarded()) {
      await this.router.navigate(['/onboarding']);
      return;
    }

    if (this.availableRoles().length > 1) {
      await this.router.navigate(['/choose-role']);
      return;
    }

    if (this.availableRoles().length === 1) {
      await this.router.navigate([`/${this.availableRoles()[0]}`]);
      return;
    }

    await this.router.navigate(['/onboarding']);
  }

  async logout(): Promise<void> {
    const baseUrl = environment.keycloak.url.replace(/\/$/, '');
    const realm = environment.keycloak.realm;
    const clientId = environment.keycloak.clientId;
    const refreshToken = this.keycloak.refreshToken;

    try {
      const logoutUrl = `${baseUrl}/realms/${realm}/protocol/openid-connect/logout`;

      const body = new HttpParams()
        .set('client_id', clientId)
        .set('refresh_token', refreshToken || '');

      await lastValueFrom(
        this.http.post(logoutUrl, body.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          responseType: 'text',
        }),
      );
    } catch (error) {
      console.error('Background token revocation skipped or failed', error);
    } finally {
      this.keycloak.clearToken();
      this.clearTokenFromStorage();
      this.isAuthenticated.set(false);
      this.userRoles.set([]);
      this.availableRoles.set([]);
      this.router.navigate(['/']);
    }
  }

  hasRole(role: string): boolean {
    return this.userRoles().includes(role);
  }

  async reloadUserData(): Promise<void> {
    await this.refreshToken();
    this.persistTokenToStorage();
    this.loadUserData();
  }
}

import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import Keycloak, { KeycloakTokenParsed } from 'keycloak-js';
import { environment } from '../../environments/environment';
import {
  KEYCLOAK_EVENT_SIGNAL,
  KeycloakEventType,
  ReadyArgs,
  typeEventArgs,
} from 'keycloak-angular';

interface AmatumToken extends KeycloakTokenParsed {
  amatum_onboarded?: boolean | 'true' | 'false';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private keycloak = inject(Keycloak);

  public isAuthenticated = signal(false);
  public isLoading = signal(true);
  public userRoles = signal<string[]>([]);
  public isOnboarded = signal(false);
  public user = signal<AmatumToken | null>(null);
  public availableRoles = signal<string[]>([]);

  public isSuperAdmin = computed(() => this.userRoles().includes('SUPER_ADMIN'));
  public isManager = computed(() => this.userRoles().includes('MANAGER'));
  public isLearner = computed(() => this.userRoles().includes('LEARNER'));

  private readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);

  public username = computed(() => this.user()?.['preferred_username'] ?? '');
  public email = computed(() => this.user()?.['email'] ?? '');
  public fullName = computed(() => this.user()?.['name'] ?? '');
  public subject = computed(() => this.user()?.['sub'] ?? '');

  constructor() {
    effect(() => {
      const event = this.keycloakSignal();

      switch (event.type) {
        case KeycloakEventType.Ready:
          this.isLoading.set(false);

          if (typeEventArgs<ReadyArgs>(event.args)) {
            this.syncFromKeycloak();
          } else {
            this.clearAuthState();
          }
          break;

        case KeycloakEventType.AuthSuccess:
          this.syncFromKeycloak();
          break;

        case KeycloakEventType.AuthRefreshSuccess:
          this.syncFromKeycloak();
          break;

        case KeycloakEventType.AuthLogout:
          this.clearAuthState();
          break;

        case KeycloakEventType.AuthRefreshError:
          this.clearAuthState();
          break;
      }
    });
  }

  private clearAuthState(): void {
    this.isAuthenticated.set(false);
    this.user.set(null);
    this.userRoles.set([]);
    this.availableRoles.set([]);
    this.isOnboarded.set(false);
  }

  async refreshToken(): Promise<boolean> {
    try {
      await this.keycloak.updateToken(30);
      this.syncFromKeycloak();
      return true;
    } catch (error) {
       this.clearAuthState();
      console.error('Token refresh failed', error);
      return false;
    }
  }

  async routeAfterLogin(targetRedirect: string | null): Promise<void> {
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

 
  hasRole(role: string): boolean {
    return this.userRoles().includes(role);
  }

  async reloadUserData(): Promise<void> {
    await this.refreshToken();
  }

  private syncFromKeycloak(): void {
    const tokenParsed = this.keycloak.tokenParsed as AmatumToken | undefined;

    this.isAuthenticated.set(this.keycloak.authenticated ?? false);

    if (!tokenParsed) {
      this.clearAuthState();
      return;
    }

    this.user.set(tokenParsed);

    this.isOnboarded.set(
      tokenParsed?.amatum_onboarded === true || tokenParsed?.amatum_onboarded === 'true',
    );

    const clientRoles: string[] =
      tokenParsed?.resource_access?.[environment.keycloak.clientId]?.roles || [];

    const realmRoles: string[] = tokenParsed?.realm_access?.roles || [];

    const allRoles = [...clientRoles, ...realmRoles];

    this.userRoles.set(allRoles);

    const available: string[] = [];

    if (allRoles.includes('SUPER_ADMIN')) {
      available.push('super-admin');
    }

    if (clientRoles.includes('MANAGER')) {
      available.push('manager');
    }

    if (clientRoles.includes('LEARNER')) {
      available.push('learner');
    }

    this.availableRoles.set(available);
  }

   async login() {
    try {
      await this.keycloak.login({ redirectUri: window.location.origin + '/auth/callback' });
    } catch (error) {
      console.error('Keycloak login trigger failed:', error);
    }
  }

   async logout(): Promise<void> {
    try {
      await this.keycloak.logout({ redirectUri: window.location.origin });
    } catch (error) {
      console.error('Keycloak logout failed:', error);
    }
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="min-h-screen bg-[#030712] flex flex-col items-center justify-center relative overflow-hidden font-sans antialiased"
    >
      <!-- Glowing background blob -->
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-120 h-120 bg-indigo-500/10 blur-[120px] rounded-full animate-pulse"
      ></div>

      <div class="relative z-10 flex flex-col items-center gap-8">
        <!-- Logo / Animated card -->
        <div class="relative">
          <div
            class="absolute inset-0 w-20 h-20 bg-indigo-600/30 rounded-2xl blur-xl animate-pulse"
          ></div>
          <div
            class="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-2xl relative z-10 animate-bounce"
          >
            A
          </div>
        </div>

        <!-- Loader dots -->
        <div class="flex items-center justify-center gap-3">
          <span
            class="w-2 h-2 rounded-full bg-indigo-500 animate-[bounce_1s_infinite_100ms]"
          ></span>
          <span
            class="w-2 h-2 rounded-full bg-purple-500 animate-[bounce_1s_infinite_200ms]"
          ></span>
          <span
            class="w-2 h-2 rounded-full bg-indigo-400 animate-[bounce_1s_infinite_300ms]"
          ></span>
        </div>
      </div>
    </div>
  `,
})
export class AuthCallbackComponent implements OnInit {
  private readonly keycloak = inject(Keycloak);
  private readonly router = inject(Router);

  async ngOnInit() {
    // Initial auth check
    if (!this.keycloak.authenticated) {
      await this.keycloak.login();
      return;
    }

    try {
      await this.keycloak.updateToken(-1);
    } catch (error) {
      console.error('Token synchronization failed', error);
    }

    const tokenParsed = this.keycloak.tokenParsed as any;
    const urlParams = new URLSearchParams(window.location.search);
    const targetRedirect = urlParams.get('target');

    if (targetRedirect && targetRedirect !== '/auth/callback') {
      this.router.navigateByUrl(targetRedirect);
      return;
    }

    const isOnboarded =
      tokenParsed?.amatum_onboarded === true || tokenParsed?.amatum_onboarded === 'true';

    if (!isOnboarded) {
      this.router.navigate(['/onboarding']);
      return;
    }

    const clientRoles: string[] = tokenParsed?.resource_access?.['lms-ui']?.roles || [];
    const isSuperAdmin = this.keycloak.hasRealmRole('SUPER_ADMIN');

    const availablePaths: string[] = [];
    if (isSuperAdmin) availablePaths.push('super-admin');
    if (clientRoles.includes('MANAGER')) availablePaths.push('manager');
    if (clientRoles.includes('LEARNER')) availablePaths.push('learner');

    if (availablePaths.length > 1) {
      this.router.navigate(['/choose-role']);
      return;
    }

    if (availablePaths.length === 1) {
      this.router.navigate([`/${availablePaths[0]}`]);
      return;
    }

    this.router.navigate(['/onboarding']);
  }
}

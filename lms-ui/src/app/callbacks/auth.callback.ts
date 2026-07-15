import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import Keycloak from 'keycloak-js';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

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
export class AuthCallbackComponent {
  private readonly authService = inject(AuthService);
  private router = inject(Router);

  private readonly targetRedirect = new URLSearchParams(window.location.search).get('target');

  private routed = false;

  constructor() {
    effect(() => {
      if (this.routed) {
        return;
      }

      if (this.authService.isLoading()) {
        return;
      }

      if (!this.authService.isAuthenticated()) {
        return;
      }

      if (!this.authService.isLoading() && !this.authService.isAuthenticated()) {
         this.router.navigate(['/']);
      }

      this.routed = true;
      void this.authService.routeAfterLogin(this.targetRedirect);
    });
  }
}

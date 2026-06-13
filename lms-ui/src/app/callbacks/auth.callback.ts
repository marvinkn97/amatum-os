import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Keycloak from 'keycloak-js';
import { AuthService } from '../services/auth.service';

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
  private readonly authService = inject(AuthService);
  private readonly keycloak = inject(Keycloak);

  async ngOnInit() {
    console.log('1. Callback started');
    console.log('2. Keycloak authenticated:', this.keycloak.authenticated);
    console.log('3. Token in memory:', !!this.keycloak.token);
    console.log('4. Token in storage:', !!sessionStorage.getItem('keycloak_token'));
    
    const urlParams = new URLSearchParams(window.location.search);
    const targetRedirect = urlParams.get('target');

    await this.authService.handleAuthCallback(targetRedirect);
  }
}

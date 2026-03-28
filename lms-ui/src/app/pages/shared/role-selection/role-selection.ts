import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-role-selection',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="min-h-screen bg-[#030712] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans antialiased"
    >
      <div class="absolute top-0 -left-20 size-96 bg-purple-600/10 blur-[120px] rounded-full"></div>
      <div
        class="absolute bottom-0 -right-20 size-96 bg-indigo-600/10 blur-[120px] rounded-full"
      ></div>

      <div class="relative z-10 max-w-5xl w-full">
        <div class="text-center mb-16 space-y-4">
          <div
            class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-widest mb-4"
          >
            Identity Verified
          </div>
          <h1 class="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Choose your
            <span class="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-indigo-400"
              >workspace</span
            >
          </h1>
          <p class="text-slate-400 max-w-md mx-auto">
            Welcome back, <span class="text-slate-200 font-bold">{{ fullName() }}</span
            >. Select a context to begin your session.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          @if (hasRole('SUPER_ADMIN')) {
            <button
              (click)="select('super-admin')"
              class="group relative p-8 rounded-3xl bg-slate-900/40 border border-white/5 hover:border-red-500/50 hover:bg-slate-900/60 transition-all duration-500 text-left overflow-hidden cursor-pointer"
            >
              <div
                class="absolute inset-0 bg-linear-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
              ></div>
              <div
                class="size-14 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-all"
              >
                <svg class="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-white mb-2">System Admin</h3>
              <p class="text-sm text-slate-400 leading-relaxed">
                Global configuration and platform-wide security management.
              </p>
              <div
                class="mt-8 flex items-center gap-2 text-red-400 text-[10px] font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all translate-x-2.5 group-hover:translate-x-0"
              >
                Enter Console <span>→</span>
              </div>
            </button>
          }

          @if (hasRole('MANAGER')) {
            <button
              (click)="select('manager')"
              class="group relative p-8 rounded-3xl bg-slate-900/40 border border-white/5 hover:border-purple-500/50 hover:bg-slate-900/60 transition-all duration-500 text-left overflow-hidden cursor-pointer"
            >
              <div
                class="absolute inset-0 bg-linear-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
              ></div>
              <div
                class="size-14 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-all"
              >
                <svg class="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0V12m0 4.5V21m7.5-4.5V12m0 4.5V21m-7.5-9h7.5M10.5 7.5h3"
                  />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-white mb-2">Manager</h3>
              <p class="text-sm text-slate-400 leading-relaxed">
                Manage your academies, content, and track member progress.
              </p>
              <div
                class="mt-8 flex items-center gap-2 text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all translate-x-2.5 group-hover:translate-x-0"
              >
                Enter Studio <span>→</span>
              </div>
            </button>
          }

          @if (hasRole('LEARNER')) {
            <button
              (click)="select('learner')"
              class="group relative p-8 rounded-3xl bg-slate-900/40 border border-white/5 hover:border-indigo-500/50 hover:bg-slate-900/60 transition-all duration-500 text-left overflow-hidden cursor-pointer"
            >
              <div
                class="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
              ></div>
              <div
                class="size-14 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-all"
              >
                <svg class="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 019.918 5.841 50.581 50.581 0 00-2.658.813m-15.482 0A48.185 48.185 0 0112 12.751a48.185 48.185 0 015.482-2.604m-2.251 10.64a44.486 44.486 0 00-4.471-4.471m0 0a44.462 44.462 0 014.471-4.471m-4.471 4.471L8.25 15.75"
                  />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-white mb-2">Learner</h3>
              <p class="text-sm text-slate-400 leading-relaxed">
                Continue your educational journey and access your certificates.
              </p>
              <div
                class="mt-8 flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all translate-x-2.5 group-hover:translate-x-0"
              >
                Start Learning <span>→</span>
              </div>
            </button>
          }
        </div>

        <div class="mt-12 text-center">
          <button
            (click)="isLogoutConfirmOpen.set(true)"
            class="text-slate-500 hover:text-slate-300 text-[10px] font-black transition-colors uppercase tracking-[0.3em] cursor-pointer"
          >
            Not you? Sign out
          </button>
        </div>
      </div>

      @if (isLogoutConfirmOpen()) {
        <div class="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div
            (click)="isLogoutConfirmOpen.set(false)"
            class="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
          ></div>
          <div
            class="relative w-full max-w-sm bg-[#0b1120] border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in slide-in-from-bottom-4 duration-300"
          >
            <div
              class="size-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-red-500/20"
            >
              <svg
                class="size-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white text-center mb-2">Confirm Sign Out</h3>
            <p class="text-sm text-slate-400 text-center mb-8 leading-relaxed">
              Are you sure? You'll need to log back in to access your workspaces.
            </p>
            <div class="flex flex-col gap-3">
              <button
                (click)="logout()"
                class="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-red-500/20 cursor-pointer"
              >
                Yes, Sign Out
              </button>
              <button
                (click)="isLogoutConfirmOpen.set(false)"
                class="w-full py-3.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl text-xs font-bold transition-all border border-white/10 cursor-pointer"
              >
                Stay Logged In
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class RoleSelectionComponent {
  private keycloak = inject(Keycloak);
  private router = inject(Router);

  fullName = signal(this.keycloak.tokenParsed?.['name'] || 'User');
  isLogoutConfirmOpen = signal(false);

  hasRole(role: string): boolean {
    return this.keycloak.hasRealmRole(role) || this.keycloak.hasResourceRole(role, 'lms-ui');
  }

  select(path: string) {
    this.router.navigate([`/${path}`]);
  }

  logout() {
    this.keycloak.logout({ redirectUri: window.location.origin });
  }
}

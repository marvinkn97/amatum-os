import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-getting-started',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  host: { class: 'dark block' },
  template: `
    <div
      class="min-h-screen bg-[#030712] text-slate-100 font-sans antialiased selection:bg-indigo-500/30"
    >
      <!-- NAVBAR -->
      <nav class="fixed top-0 w-full z-40 border-b border-white/5 backdrop-blur-xl bg-[#030712]/50">
        <div class="max-w-7xl mx-auto px-4 md:px-6 h-16 flex justify-between items-center">
          <!-- Logo -->
          <div class="flex items-center gap-2 font-black text-xl tracking-tighter cursor-pointer">
            <div
              class="size-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm"
            >
              A
            </div>
            AMATUM<span class="text-indigo-600 ml-1 text-xs uppercase tracking-[0.2em]"
              >Lumina</span
            >
          </div>

          <!-- Desktop Menu -->
          <div class="hidden md:flex items-center gap-8">
            <a
              routerLink="/explore"
              class="text-sm font-semibold text-slate-400 hover:text-white transition-colors"
              >Browse Courses</a
            >
            <button
              (click)="launch()"
              class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-full transition-all active:scale-95 cursor-pointer"
            >
              Sign In
            </button>
          </div>

          <!-- Hamburger Mobile Button -->
          <div class="flex md:hidden items-center">
            <button
              (click)="isMenuOpen.set(!isMenuOpen())"
              class="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              @if (!isMenuOpen()) {
                <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6h16M4 12h16m-7 6h7" stroke-width="2" stroke-linecap="round" />
                </svg>
              } @else {
                <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round" />
                </svg>
              }
            </button>
          </div>
        </div>
      </nav>

      <!-- MOBILE MENU OVERLAY -->
      @if (isMenuOpen()) {
        <div class="fixed inset-0 z-50 bg-[#030712]/95 backdrop-blur-sm flex flex-col pt-24 px-6">
          <!-- Close button top-right -->
          <button
            (click)="isMenuOpen.set(false)"
            class="absolute top-6 right-6 p-3 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <!-- Navigation links -->
          <nav class="flex flex-col space-y-4">
            <a
              routerLink="/explore"
              (click)="isMenuOpen.set(false)"
              class="flex items-center justify-between w-full px-4 py-3 bg-white/5 rounded-xl text-white text-lg font-semibold hover:bg-indigo-600 transition-colors cursor-pointer"
            >
              <span>Browse Courses</span>
              <svg
                class="w-5 h-5 text-white group-hover:text-indigo-100 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>

            <button
              (click)="launch(); isMenuOpen.set(false)"
              class="w-full px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-all active:scale-95 cursor-pointer"
            >
              Sign In
            </button>
          </nav>
        </div>
      }

      <!-- MAIN HERO -->
      <main class="relative pt-40 pb-20 px-6">
        <div class="max-w-4xl mx-auto text-center relative z-10">
          <h1 class="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6">
            Learn new skills. <br />
            <span class="text-indigo-500">Build your own academy.</span>
          </h1>
          <p class="text-lg md:text-xl text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
            One platform for learners to grow and companies to train their teams securely.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              (click)="launch()"
              class="px-8 py-4 bg-white text-[#030712] font-bold rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
            >
              Start Learning Today
            </button>
            <button
              (click)="launch()"
              class="px-8 py-4 bg-slate-900 border border-white/10 text-white font-bold rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
            >
              Create a Company Workspace
            </button>
          </div>
        </div>
      </main>

      <!-- FEATURES SECTION -->
      <section class="max-w-7xl mx-auto px-6 py-20">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Individuals Card -->
          <div
            class="group p-8 rounded-4xl bg-linear-to-b from-white/5 to-transparent border border-white/5 flex flex-col"
          >
            <div class="mb-8">
              <h2 class="text-3xl font-bold mb-2 text-white">For Learners</h2>
              <p class="text-slate-400">
                Everything you need to master a new topic and get certified.
              </p>
            </div>

            <div class="mt-auto bg-[#0a0f1d] rounded-2xl border border-white/10 p-6 shadow-2xl">
              <div class="flex items-center justify-between mb-6">
                <div class="h-4 w-32 bg-white/10 rounded"></div>
                <div class="size-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <div class="size-2 rounded-full bg-indigo-500 animate-pulse"></div>
                </div>
              </div>
              <div class="space-y-4">
                <div
                  class="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5"
                >
                  <div
                    class="size-10 bg-indigo-600 rounded-lg flex items-center justify-center text-xs"
                  >
                    JS
                  </div>
                  <div class="flex-1">
                    <div class="h-2 w-20 bg-white/20 rounded mb-2"></div>
                    <div class="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div class="h-full w-[65%] bg-indigo-500"></div>
                    </div>
                  </div>
                </div>
                <div
                  class="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5 opacity-50"
                >
                  <div
                    class="size-10 bg-purple-600 rounded-lg flex items-center justify-center text-xs"
                  >
                    UX
                  </div>
                  <div class="flex-1">
                    <div class="h-2 w-16 bg-white/20 rounded mb-2"></div>
                    <div class="h-1.5 w-full bg-white/5 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Companies Card -->
          <div
            class="group p-8 rounded-4xl bg-linear-to-b from-indigo-500/10 to-transparent border border-indigo-500/10 flex flex-col"
          >
            <div class="mb-8 text-right md:text-left">
              <h2 class="text-3xl font-bold mb-2 text-white">For Companies</h2>
              <p class="text-slate-400">
                Your own private space to train employees or sell your expertise.
              </p>
            </div>

            <div
              class="mt-auto bg-[#0a0f1d] rounded-2xl border border-indigo-500/20 p-6 shadow-2xl relative overflow-hidden"
            >
              <div class="flex gap-2 mb-6">
                <div class="h-4 w-24 bg-indigo-500/20 rounded"></div>
                <div class="h-4 w-12 bg-white/5 rounded"></div>
              </div>
              <div class="grid grid-cols-3 gap-2">
                <div
                  class="aspect-square rounded-lg bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center flex-col gap-2"
                >
                  <svg
                    class="size-5 text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 4v16m8-8H4" stroke-width="2" stroke-linecap="round" />
                  </svg>
                  <span class="text-[8px] font-bold text-indigo-400 uppercase tracking-tighter"
                    >Add Video</span
                  >
                </div>
                <div class="aspect-square rounded-lg bg-white/5 border border-white/5"></div>
                <div class="aspect-square rounded-lg bg-white/5 border border-white/5"></div>
              </div>
              <div
                class="absolute bottom-4 right-4 bg-indigo-600 text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-xl animate-bounce"
              >
                PUBLISH TO MARKETPLACE
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FOOTER -->
      <footer class="py-20 border-t border-white/5">
        <div
          class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <p class="text-slate-500 text-sm">© 2026 AMATUM LUMINA. Secure, Private, Simple.</p>
          <div class="flex gap-6">
            <a href="#" class="text-slate-500 hover:text-white text-sm">Privacy (GDPR)</a>
            <a href="#" class="text-slate-500 hover:text-white text-sm">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  `,
})
export class GettingStarted {
  private readonly keycloak = inject(Keycloak);
  isMenuOpen = signal(false);

  async launch() {
    try {
      await this.keycloak.login({ redirectUri: window.location.origin + '/auth/callback' });
    } catch (error) {
      console.error('Keycloak login trigger failed:', error);
    }
  }
}

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-getting-started-opus',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  host: { class: 'dark block' },
  template: `
    <div
      class="min-h-screen bg-[#030712] text-slate-100 font-sans antialiased selection:bg-emerald-500/30"
    >
      <div class="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full"
        ></div>
        <div
          class="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-blue-600/5 blur-[120px] rounded-full"
        ></div>
      </div>

      <nav class="fixed top-0 w-full z-40 border-b border-white/5 backdrop-blur-xl bg-[#030712]/50">
        <div class="max-w-7xl mx-auto px-4 md:px-6 h-16 flex justify-between items-center">
          <div class="flex items-center gap-2 font-black text-xl tracking-tighter cursor-pointer">
            <div
              class="size-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-sm shadow-lg shadow-emerald-600/20"
            >
              A
            </div>
            AMATUM<span class="text-emerald-500 ml-1 text-xs uppercase tracking-[0.2em]">Opus</span>
          </div>

          <div class="hidden md:flex items-center gap-8">
            <a
              routerLink="browse-jobs"
              class="text-sm font-semibold text-slate-400 hover:text-white transition-colors"
              >Browse Jobs</a
            >
            <button
              (click)="launch()"
              class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-full transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
            >
              Sign In
            </button>
          </div>

          <div class="flex md:hidden items-center">
            <button
              (click)="isMenuOpen.set(!isMenuOpen())"
              class="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                @if (!isMenuOpen()) {
                  <path d="M4 6h16M4 12h16m-7 6h7" stroke-width="2" stroke-linecap="round" />
                } @else {
                  <path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round" />
                }
              </svg>
            </button>
          </div>
        </div>
      </nav>

      @if (isMenuOpen()) {
        <div class="fixed inset-0 z-50 bg-[#030712]/98 backdrop-blur-md flex flex-col pt-24 px-6">
          <nav class="flex flex-col space-y-4">
            <a
              routerLink="/explore"
              (click)="isMenuOpen.set(false)"
              class="flex items-center justify-between w-full px-4 py-4 bg-white/5 rounded-2xl text-white text-lg font-semibold"
            >
              <span>Browse Jobs</span>
              <svg
                class="size-5 text-emerald-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 5l7 7-7 7"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </a>
            <button
              (click)="launch(); isMenuOpen.set(false)"
              class="w-full px-6 py-4 bg-emerald-600 text-white font-bold rounded-2xl"
            >
              Sign In
            </button>
          </nav>
        </div>
      }

      <main class="relative pt-44 pb-20 px-6">
        <div class="max-w-4xl mx-auto text-center relative z-10">
          <div
            class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-6 tracking-wide uppercase"
          >
            <span class="relative flex h-2 w-2">
              <span
                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
              ></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Institutional Grade Talent Network
          </div>
          <h1 class="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6">
            The job you want. <br />
            <span class="text-emerald-500">The talent you need.</span>
          </h1>
          <p
            class="text-lg md:text-xl text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed font-medium"
          >
            A secure professional marketplace connecting expert talent with high-impact
            opportunities.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              (click)="launch()"
              class="px-8 py-4 bg-white text-[#030712] font-bold rounded-xl hover:bg-slate-200 transition-all shadow-xl"
            >
              Find a Job
            </button>
            <button
              (click)="launch()"
              class="px-8 py-4 bg-slate-900 border border-white/10 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-xl"
            >
              Post a Position
            </button>
          </div>
        </div>
      </main>

      <section class="max-w-7xl mx-auto px-6 py-20">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div
            class="group p-10 rounded-[2.5rem] bg-linear-to-b from-white/5 to-transparent border border-white/5 flex flex-col transition-all hover:border-white/10"
          >
            <div class="mb-12">
              <h2 class="text-3xl font-bold mb-3 text-white">For Talent</h2>
              <p class="text-slate-400 text-lg">
                Apply to verified roles and track every step of your journey.
              </p>
            </div>

            <div
              class="mt-auto bg-[#0a0f1d] rounded-3xl border border-white/10 p-6 shadow-2xl relative"
            >
              <div class="space-y-4">
                <div
                  class="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-white/[0.07] transition-colors"
                >
                  <div class="flex items-center gap-4">
                    <div
                      class="size-10 bg-emerald-600/20 rounded-xl flex items-center justify-center"
                    >
                      <div
                        class="size-2.5 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.8)]"
                      ></div>
                    </div>
                    <div>
                      <div class="h-2.5 w-24 bg-white/20 rounded-full mb-2"></div>
                      <div class="h-1.5 w-16 bg-white/10 rounded-full"></div>
                    </div>
                  </div>
                  <span class="text-[10px] font-black text-emerald-500 tracking-widest uppercase"
                    >Interviewing</span
                  >
                </div>
                <div
                  class="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 opacity-40"
                >
                  <div class="flex items-center gap-4">
                    <div class="size-10 bg-slate-700/30 rounded-xl"></div>
                    <div>
                      <div class="h-2.5 w-32 bg-white/20 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class="group p-10 rounded-[2.5rem] bg-linear-to-b from-emerald-500/10 to-transparent border border-emerald-500/10 flex flex-col transition-all hover:border-emerald-500/20"
          >
            <div class="mb-12 text-right md:text-left">
              <h2 class="text-3xl font-bold mb-3 text-white">For Managers</h2>
              <p class="text-slate-400 text-lg">
                Streamline hiring with built-in pipeline management.
              </p>
            </div>

            <div
              class="mt-auto bg-[#0a0f1d] rounded-3xl border border-emerald-500/20 p-8 shadow-2xl relative overflow-hidden"
            >
              <div class="flex justify-between items-center mb-8">
                <div class="flex flex-col gap-2">
                  <div class="h-4 w-32 bg-emerald-500/20 rounded-full"></div>
                  <div class="h-2 w-16 bg-white/5 rounded-full"></div>
                </div>
                <div class="flex -space-x-3">
                  <div
                    class="size-10 rounded-full bg-slate-800 border-2 border-[#0a0f1d] ring-2 ring-emerald-500/20"
                  ></div>
                  <div
                    class="size-10 rounded-full bg-emerald-600 border-2 border-[#0a0f1d] flex items-center justify-center text-[10px] font-bold"
                  >
                    JD
                  </div>
                  <div class="size-10 rounded-full bg-slate-700 border-2 border-[#0a0f1d]"></div>
                </div>
              </div>
              <div class="grid grid-cols-3 gap-3">
                <div
                  class="h-12 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center"
                >
                  <div class="h-1.5 w-8 bg-white/10 rounded-full"></div>
                </div>
                <div
                  class="h-12 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center"
                >
                  <div class="h-1.5 w-8 bg-white/10 rounded-full"></div>
                </div>
                <div
                  class="h-12 bg-emerald-600/20 rounded-xl border border-emerald-500/30 flex items-center justify-center"
                >
                  <div class="h-1.5 w-8 bg-emerald-500/40 rounded-full"></div>
                </div>
              </div>
              <div
                class="absolute bottom-4 right-4 bg-emerald-600 text-[10px] font-black px-4 py-2 rounded-xl shadow-xl tracking-tighter hover:scale-105 transition-transform cursor-pointer"
              >
                PUBLISH VACANCY
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer class="py-20 border-t border-white/5 relative z-10">
        <div
          class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <p class="text-slate-500 text-sm font-medium">
            © 2026 AMATUM OPUS. Secure. Professional. Simple.
          </p>
          <div class="flex gap-8">
            <a href="#" class="text-slate-500 hover:text-white text-sm transition-colors"
              >Privacy</a
            >
            <a href="#" class="text-slate-500 hover:text-white text-sm transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  `,
})
export class GettingStarted {
  isMenuOpen = signal(false);

  async launch() {}
}

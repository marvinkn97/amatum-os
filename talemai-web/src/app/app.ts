import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  host: { class: 'dark block font-sans antialiased' },
  template: `
    <div
      class="min-h-screen bg-[#030712] text-slate-100 overflow-x-hidden selection:bg-emerald-500/30"
    >
      <div class="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          class="absolute top-[-10%] left-1/2 -translate-x-1/2 w-200 h-200 rounded-full bg-indigo-600/15 blur-[140px] animate-pulse"
        ></div>

        <div
          class="absolute top-1/4 -left-32 w-125 h-125 rounded-full bg-sky-500/15 blur-[140px]"
        ></div>

        <div
          class="absolute bottom-0 -right-32 w-150 h-150 rounded-full bg-emerald-500/15 blur-[140px]"
        ></div>
      </div>

      <nav
        class="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-[#030712]/80 backdrop-blur-2xl shadow-xl shadow-black/40"
      >
        <div class="max-w-7xl mx-auto h-20 px-4 sm:px-6 md:px-8 flex items-center justify-between">
          <div class="flex items-center gap-2.5 sm:gap-3.5 group cursor-pointer">
            <div
              class="size-7 sm:size-9 rounded-lg bg-linear-to-br from-indigo-500 via-sky-500 to-emerald-500 flex items-center justify-center font-black text-white text-sm sm:text-base shadow-xl shadow-sky-500/25 group-hover:scale-105 transition-transform"
            >
              A
            </div>

            <div class="flex items-baseline gap-1.5 sm:gap-2">
              <div class="font-black tracking-tighter text-lg sm:text-xl text-white leading-none">
                AMATUM
              </div>
              <span
                class="text-sky-400 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold leading-none"
                >Talemai</span
              >
            </div>
          </div>
        </div>
      </nav>

      <section class="relative pt-44 pb-28 px-6 text-center">
        <div class="max-w-5xl mx-auto relative z-10">
          <h1 class="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-[1.05]">
            The Intelligence Platform
            <br />
            <span
              class="bg-linear-to-r from-indigo-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent"
            >
              for Learning & Talent
            </span>
          </h1>

          <p
            class="mt-8 max-w-3xl mx-auto text-lg md:text-xl text-slate-300 leading-relaxed font-medium"
          >
            Join the ecosystem that's redefining how people learn, develop, and discover
            opportunities through Artificial Intelligence.
          </p>

          <div class="mt-12 flex flex-col sm:flex-row justify-center gap-6">
            <a
              href="https://lumina.amatum.luv2kode.co.ke"
              class="group relative inline-flex items-center justify-center px-10 py-5 rounded-2xl bg-linear-to-r from-indigo-600 to-sky-600 font-extrabold text-white text-lg shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] transition-all active:scale-95 overflow-hidden"
            >
              <span class="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <span class="relative z-10 flex items-center gap-3">
                Explore Learning
                <svg class="size-5 text-sky-200 group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </a>

            <a
              href="https://opus.amatum.luv2kode.co.ke"
              class="group relative inline-flex items-center justify-center px-10 py-5 rounded-2xl bg-linear-to-r from-sky-600 to-emerald-600 font-extrabold text-white text-lg shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] transition-all active:scale-95 overflow-hidden"
            >
              <span class="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <span class="relative z-10 flex items-center gap-3">
                Explore Careers
                <svg class="size-5 text-emerald-200 group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </section>

      <section class="pb-32 px-6">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-20">
            <div
              class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-300 text-xs uppercase tracking-[0.3em] font-bold shadow-lg shadow-sky-500/10"
            >
              AI Features
            </div>

            <h2 class="mt-6 text-4xl md:text-6xl font-black tracking-tight">
              Intelligence at Every Step
            </h2>

            <p class="mt-4 text-slate-300 text-lg max-w-2xl mx-auto font-medium">
              AI-powered features that transform how people learn, develop, and discover
              opportunities
            </p>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div
              class="group p-10 rounded-[2.5rem] bg-[#0a0f1d] border border-white/5 flex flex-col transition-all hover:border-white/10 shadow-2xl"
            >
              <div
                class="size-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-indigo-900/20"
              >
                <svg
                  class="size-6 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>

              <h3 class="mt-6 text-xl font-bold tracking-tight text-white">
                Personalized Learning
              </h3>

              <p class="mt-3 text-slate-400 text-sm leading-relaxed font-medium">
                Adaptive learning paths that adjust in real-time based on progress, performance, and
                learning style.
              </p>
            </div>

            <div
              class="group p-10 rounded-[2.5rem] bg-[#0a0f1d] border border-white/5 flex flex-col transition-all hover:border-white/10 shadow-2xl"
            >
              <div
                class="size-14 rounded-2xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-sky-900/20"
              >
                <svg
                  class="size-6 text-sky-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <h3 class="mt-6 text-xl font-bold tracking-tight text-white">Talent Matching</h3>

              <p class="mt-3 text-slate-400 text-sm leading-relaxed font-medium">
                AI-powered matching that connects skilled professionals with the right opportunities
                at the right time.
              </p>
            </div>

            <div
              class="group p-10 rounded-[2.5rem] bg-[#0a0f1d] border border-white/5 flex flex-col transition-all hover:border-white/10 shadow-2xl"
            >
              <div
                class="size-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-emerald-900/20"
              >
                <svg
                  class="size-6 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                  />
                </svg>
              </div>

              <h3 class="mt-6 text-xl font-bold tracking-tight text-white">Skills Intelligence</h3>

              <p class="mt-3 text-slate-400 text-sm leading-relaxed font-medium">
                Analyze skills gaps, identify development opportunities, and build future-ready
                capabilities with AI insights.
              </p>
            </div>

            <div
              class="group p-10 rounded-[2.5rem] bg-[#0a0f1d] border border-white/5 flex flex-col transition-all hover:border-white/10 shadow-2xl"
            >
              <div
                class="size-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-purple-900/20"
              >
                <svg
                  class="size-6 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>

              <h3 class="mt-6 text-xl font-bold tracking-tight text-white">Automation</h3>

              <p class="mt-3 text-slate-400 text-sm leading-relaxed font-medium">
                Automate repetitive tasks, streamline workflows, and focus on what matters most with
                intelligent automation.
              </p>
            </div>

            <div
              class="group p-10 rounded-[2.5rem] bg-[#0a0f1d] border border-white/5 flex flex-col transition-all hover:border-white/10 shadow-2xl"
            >
              <div
                class="size-14 rounded-2xl bg-pink-600/20 border border-pink-500/30 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-pink-900/20"
              >
                <svg
                  class="size-6 text-pink-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>

              <h3 class="mt-6 text-xl font-bold tracking-tight text-white">Analytics</h3>

              <p class="mt-3 text-slate-400 text-sm leading-relaxed font-medium">
                Real-time analytics and insights that help you understand performance, engagement,
                and impact across the ecosystem.
              </p>
            </div>

            <div
              class="p-10 rounded-[2.5rem] bg-[#0a0f1d] border border-white/5 flex flex-col justify-center transition-all hover:border-white/10 shadow-2xl"
            >
              <div class="text-xs text-sky-400 font-bold uppercase tracking-[0.25em]">And More</div>

              <p class="mt-3 text-slate-400 text-sm leading-relaxed font-medium">
                Continuous innovation with new AI capabilities being added to enhance learning and
                talent development.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer class="border-t border-white/10 bg-[#030712]/90 backdrop-blur-2xl">
        <div class="max-w-7xl mx-auto px-6 md:px-8 py-16">
          <div
            class="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400 font-medium"
          >
            <p>&copy; {{ currentYear }} Amatum. All rights reserved.</p>

            <div class="flex gap-8">
              <a href="#" class="hover:text-white transition-colors">Privacy(GDPR)</a>

              <a href="#" class="hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
})
export class App {
  currentYear = new Date().getFullYear();
}
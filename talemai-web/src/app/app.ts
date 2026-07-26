import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  host: { class: 'dark block font-sans antialiased' },
  template: `
    <div class="min-h-screen bg-[#030712] text-slate-100 overflow-x-hidden selection:bg-sky-500/30">
      <div class="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
        <div
          class="absolute top-[-10%] left-1/2 -translate-x-1/2 w-150 h-150 rounded-full bg-indigo-600/10 blur-[120px]"
        ></div>

        <div
          class="absolute top-1/4 -left-32 w-100 h-100 rounded-full bg-sky-500/10 blur-[120px]"
        ></div>

        <div
          class="absolute bottom-0 -right-32 w-100 h-100 rounded-full bg-emerald-500/10 blur-[120px]"
        ></div>
      </div>

      <nav
        class="fixed top-0 inset-x-0 z-50 bg-[#030712]/90 backdrop-blur-xl"
      >
        <div class="max-w-7xl mx-auto h-20 px-6 sm:px-8 flex items-center justify-between">
          <div class="flex items-center gap-3 cursor-pointer">
            <div
              class="size-8 rounded-lg bg-linear-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center font-black text-white text-sm shadow-lg shadow-emerald-500/20"
            >
              A
            </div>

            <div class="flex items-baseline gap-2">
              <div class="font-bold tracking-tight text-lg text-white leading-none">AMATUM</div>
              <span
                class="text-sky-400 text-sm uppercase tracking-widest font-semibold leading-none"
                >Talemai</span
              >
            </div>
          </div>
        </div>
      </nav>

      <section class="relative pt-36 md:pt-48 pb-20 md:pb-32 px-6 text-center">
        <div class="max-w-5xl mx-auto relative z-10">
          <h1
            class="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight text-white leading-[1.08]"
          >
            The Intelligence Platform
            <br />
            <span
              class="bg-linear-to-r from-indigo-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent"
            >
              for Learning & Talent
            </span>
          </h1>

          <p
            class="mt-8 max-w-2xl mx-auto text-lg sm:text-xl text-slate-400 leading-relaxed font-normal"
          >
            Join the ecosystem that's redefining how people learn, develop, and discover
            opportunities through Artificial Intelligence.
          </p>

          <div class="mt-10 flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
            <a
              href="https://lumina.amatum.luv2kode.co.ke"
              class="w-full inline-flex items-center justify-center px-6 py-4 rounded-xl bg-white text-slate-900 font-semibold text-base hover:bg-slate-200 transition-colors shadow-lg shadow-white/5"
            >
              Explore Learning
            </a>

            <a
              href="https://opus.amatum.luv2kode.co.ke"
              class="w-full inline-flex items-center justify-center px-6 py-4 rounded-xl bg-slate-800 text-white font-semibold text-base hover:bg-slate-700 border border-slate-700 transition-colors shadow-lg shadow-black/20"
            >
              Explore Talent
            </a>
          </div>
        </div>
      </section>

      <section class="pb-32 px-6 relative z-10">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16">
            <div
              class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-sky-500/20 bg-sky-500/10 text-sky-300 text-xs uppercase tracking-widest font-semibold"
            >
              AI Features
            </div>

            <h2 class="mt-4 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
              Intelligence at Every Step
            </h2>

            <p class="mt-3 text-slate-400 text-base max-w-xl mx-auto font-normal">
              AI-powered features that transform how people learn, develop, and discover
              opportunities.
            </p>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              class="p-8 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 flex flex-col hover:border-slate-700 transition-colors"
            >
              <div
                class="size-12 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6"
              >
                <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-white">Personalized Learning</h3>
              <p class="mt-2 text-slate-400 text-sm leading-relaxed">
                Adaptive learning paths that adjust in real-time based on progress, performance, and
                learning style.
              </p>
            </div>

            <div
              class="p-8 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 flex flex-col hover:border-slate-700 transition-colors"
            >
              <div
                class="size-12 rounded-xl bg-sky-600/15 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-6"
              >
                <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-white">Talent Matching</h3>
              <p class="mt-2 text-slate-400 text-sm leading-relaxed">
                AI-powered matching that connects skilled professionals with the right opportunities
                at the right time.
              </p>
            </div>

            <div
              class="p-8 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 flex flex-col hover:border-slate-700 transition-colors"
            >
              <div
                class="size-12 rounded-xl bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6"
              >
                <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                  />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-white">Skills Intelligence</h3>
              <p class="mt-2 text-slate-400 text-sm leading-relaxed">
                Analyze skills gaps, identify development opportunities, and build future-ready
                capabilities with AI insights.
              </p>
            </div>

            <div
              class="p-8 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 flex flex-col hover:border-slate-700 transition-colors"
            >
              <div
                class="size-12 rounded-xl bg-purple-600/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-6"
              >
                <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-white">Automation</h3>
              <p class="mt-2 text-slate-400 text-sm leading-relaxed">
                Automate repetitive tasks, streamline workflows, and focus on what matters most with
                intelligent automation.
              </p>
            </div>

            <div
              class="p-8 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 flex flex-col hover:border-slate-700 transition-colors"
            >
              <div
                class="size-12 rounded-xl bg-pink-600/15 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-6"
              >
                <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-white">Analytics</h3>
              <p class="mt-2 text-slate-400 text-sm leading-relaxed">
                Real-time analytics and insights that help you understand performance, engagement,
                and impact across the ecosystem.
              </p>
            </div>

            <div
              class="p-8 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 flex flex-col justify-center hover:border-slate-700 transition-colors"
            >
              <div class="text-xs text-sky-400 font-bold uppercase tracking-widest mb-3">
                And More
              </div>
              <h3 class="text-lg font-bold text-white">Continuous Innovation</h3>
              <p class="mt-2 text-slate-400 text-sm leading-relaxed">
                New AI capabilities continuously added to enhance learning and talent development.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer class="border-t border-white/10 bg-[#030712]">
        <div class="max-w-7xl mx-auto px-6 py-12">
          <div
            class="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 font-normal"
          >
            <p>&copy; {{ currentYear }} Amatum. All rights reserved.</p>

            <div class="flex gap-6">
              <a href="#" class="hover:text-slate-300 transition-colors">Privacy</a>
              <a href="#" class="hover:text-slate-300 transition-colors">Terms</a>
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

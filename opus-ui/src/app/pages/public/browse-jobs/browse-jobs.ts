import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

@Component({
  selector: 'app-browse-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RouterLink],
  host: {
    class:
      'dark block min-h-screen bg-[#030712] text-slate-100 antialiased selection:bg-emerald-500/30',
  },
  template: `
    <!-- Background Accents -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full"
      ></div>
      <div
        class="absolute bottom-[20%] -right-[10%] w-[30%] h-[30%] bg-blue-600/5 blur-[120px] rounded-full"
      ></div>
    </div>

    <!-- Navigation -->
    <nav class="fixed top-0 w-full z-40 backdrop-blur-xl bg-[#030712]/50">
      <div class="max-w-7xl mx-auto px-4 md:px-6 h-16 flex justify-between items-center">
        <!-- Logo -->
        <div
          routerLink="/"
          class="flex items-center gap-2 font-black text-xl tracking-tighter cursor-pointer"
        >
          <div
            class="size-9 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform"
          >
            A
          </div>
          <div class="flex items-baseline gap-2">
            <div class="font-bold tracking-tight text-xl text-white leading-none">AMATUM</div>
            <span
              class="text-emerald-400 text-xl uppercase tracking-widest font-semibold leading-none"
              >Opus</span
            >
          </div>
        </div>

        <!-- Desktop Menu -->
        <div class="hidden md:flex items-center gap-8">
          <a
            routerLink="/"
            class="text-sm font-semibold text-slate-400 hover:text-white transition-colors"
            >Home</a
          >
          <button
            (click)="launch()"
            class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-full transition-all active:scale-95 shadow-lg shadow-emerald-900/20 cursor-pointer"
          >
            Sign In
          </button>
        </div>

        <!-- Mobile Toggle -->
        <div class="flex md:hidden items-center">
          <button
            (click)="isMenuOpen.set(!isMenuOpen())"
            class="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16m-7 6h7" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </nav>

    <!-- Mobile Menu Overlay -->
    @if (isMenuOpen()) {
      <div class="fixed inset-0 z-50 bg-[#030712]/98 backdrop-blur-md flex flex-col pt-24 px-6">
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
        <nav class="flex flex-col space-y-4">
          <a
            routerLink="/"
            (click)="isMenuOpen.set(false)"
            class="flex items-center justify-between w-full px-4 py-4 bg-white/5 rounded-2xl text-white text-lg font-semibold"
            >Home</a
          >
          <button
            (click)="launch(); isMenuOpen.set(false)"
            class="w-full px-6 py-4 bg-emerald-600 text-white font-bold rounded-2xl cursor-pointer"
          >
            Sign In
          </button>
        </nav>
      </div>
    }

    <!-- Content -->
    <div class="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 space-y-8">
      <header class="max-w-3xl">
        <h1 class="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4">
          Discover <span class="text-emerald-500">Opportunities.</span>
        </h1>
        <p class="text-slate-400 text-lg font-medium leading-relaxed">
          The Opus network hosts verified institutional opportunities. Refine parameters below or
          converse directly with our AI to uncover ideal opportunities.
        </p>
      </header>

      <!-- AI Chat Window (Refined Terminal/Assistant Look) -->
      <section
        class="rounded-[2.5rem] bg-linear-to-b from-[#0a0f1d] to-[#030712] border border-emerald-500/20 shadow-2xl overflow-hidden backdrop-blur-md"
      >
        <!-- Window Title Bar -->
        <div class="px-6 py-4 bg-white/2 border-b border-white/5 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="flex gap-1.5">
              <div class="size-3 rounded-full bg-rose-500/80"></div>
              <div class="size-3 rounded-full bg-amber-500/80"></div>
              <div class="size-3 rounded-full bg-emerald-500/80"></div>
            </div>
            <span class="text-xs font-bold text-slate-400 ml-2 font-mono"
              >opus-ai-agent://search</span
            >
          </div>
        </div>

        <!-- Chat Stream Body -->
        <div class="p-6 md:p-8 space-y-6 max-h-80 overflow-y-auto">
          @for (msg of messages(); track $index) {
            <div class="flex items-start gap-4">
              @if (msg.sender === 'ai') {
                <div
                  class="size-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xs shrink-0 shadow-lg shadow-emerald-900/20"
                >
                  <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div
                  class="flex-1 bg-white/3 border border-white/5 rounded-2xl p-4 text-slate-200 text-xs md:text-sm leading-relaxed shadow-inner"
                >
                  {{ msg.text }}
                </div>
              } @else {
                <div
                  class="size-8 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 font-bold text-xs shrink-0 ml-auto order-2"
                >
                  <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div
                  class="flex-1 bg-emerald-600/10 border border-emerald-500/20 rounded-2xl p-4 text-white text-xs md:text-sm leading-relaxed ml-12 order-1"
                >
                  {{ msg.text }}
                </div>
              }
            </div>
          }
        </div>

        <!-- Chat Input Bar -->
        <div class="p-4 md:p-6 bg-white/1 border-t border-white/5">
          <div class="relative flex items-center">
            <span class="absolute left-4 text-emerald-500 font-mono text-sm font-bold">></span>
            <input
              type="text"
              [ngModel]="currentMessage()"
              (ngModelChange)="currentMessage.set($event)"
              (keydown.enter)="handleEnter($event)"
              placeholder="Ask AI to query 110+ mandates (e.g., 'Senior remote contracts above $180k')..."
              class="w-full bg-[#030712] border border-white/10 rounded-2xl pl-9 pr-5 py-4 text-xs md:text-sm focus:border-emerald-500/50 outline-none transition-all text-white placeholder-slate-500 shadow-inner"
            />
          </div>
        </div>
      </section>

      <!-- Horizontal Filter Parameters -->
      <section
        class="p-6 md:p-8 rounded-[2.5rem] bg-white/2 border border-white/5 backdrop-blur-sm space-y-6"
      >
        <h2 class="text-xs font-black uppercase tracking-widest text-white">Refine Parameters</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
          <!-- Job Type -->
          <div>
            <label class="text-[10px] font-bold text-slate-500 uppercase block mb-2.5"
              >Employment Type</label
            >
            <div class="flex flex-wrap gap-1.5">
              @for (
                type of ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
                track type
              ) {
                <button
                  (click)="toggleType(type)"
                  [class]="
                    selectedTypes().includes(type)
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-white/5 border-white/5 text-slate-400'
                  "
                  class="px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all hover:border-white/20 cursor-pointer"
                >
                  {{ type }}
                </button>
              }
            </div>
          </div>

          <!-- Work Mode -->
          <div>
            <label class="text-[10px] font-bold text-slate-500 uppercase block mb-2.5"
              >Work Mode</label
            >
            <div class="flex flex-wrap gap-1.5">
              @for (mode of ['Remote', 'Hybrid', 'On-site']; track mode) {
                <button
                  (click)="toggleWorkMode(mode)"
                  [class]="
                    selectedWorkModes().includes(mode)
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-white/5 border-white/5 text-slate-400'
                  "
                  class="px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all hover:border-white/20 cursor-pointer"
                >
                  {{ mode }}
                </button>
              }
            </div>
          </div>

          <!-- Experience Level -->
          <div>
            <label class="text-[10px] font-bold text-slate-500 uppercase block mb-2.5"
              >Experience Level</label
            >
            <div class="flex flex-wrap gap-1.5">
              @for (
                level of ['Entry(0-1)', 'Junior(1-3)', 'Mid(3-5)', 'Senior(5+)', 'Executive(8+)'];
                track level
              ) {
                <button
                  (click)="toggleExperience(level)"
                  [class]="
                    selectedExperience().includes(level)
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-white/5 border-white/5 text-slate-400'
                  "
                  class="px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all hover:border-white/20 cursor-pointer"
                >
                  {{ level }}
                </button>
              }
            </div>
          </div>

          <!-- Salary Range Component -->
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <label class="text-[10px] font-bold text-slate-500 uppercase">Minimum Salary</label>
              <span class="text-xs font-black text-emerald-400"
                >\${{ salaryRange() | number }}k / yr</span
              >
            </div>
            <input
              type="range"
              min="50"
              max="350"
              step="10"
              [ngModel]="salaryRange()"
              (ngModelChange)="salaryRange.set($event)"
              class="w-full accent-emerald-500 bg-white/10 rounded-lg h-2 cursor-pointer"
            />
            <div class="flex justify-between text-[9px] font-bold text-slate-600">
              <span>$50k</span>
              <span>$200k</span>
              <span>$350k+</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class BrowseJobsComponent {
  isMenuOpen = signal(false);
  selectedTypes = signal<string[]>([]);
  selectedWorkModes = signal<string[]>([]);
  selectedExperience = signal<string[]>([]);
  salaryRange = signal<number>(120);

  currentMessage = signal('');
  messages = signal<ChatMessage[]>([
    {
      sender: 'ai',
      text: 'Hello! I am your Opus AI recruitment assistant. Type any requirement below and press Enter to instantly search our 110+ verified opportunities.',
    },
  ]);

  toggleType(type: string) {
    const current = this.selectedTypes();
    this.selectedTypes.set(
      current.includes(type) ? current.filter((t) => t !== type) : [...current, type],
    );
  }

  toggleWorkMode(mode: string) {
    const current = this.selectedWorkModes();
    this.selectedWorkModes.set(
      current.includes(mode) ? current.filter((m) => m !== mode) : [...current, mode],
    );
  }

  toggleExperience(level: string) {
    const current = this.selectedExperience();
    this.selectedExperience.set(
      current.includes(level) ? current.filter((l) => l !== level) : [...current, level],
    );
  }

  handleEnter(event: Event) {
    event.preventDefault();
    const text = this.currentMessage().trim();
    if (!text) return;

    this.messages.update((msgs) => [...msgs, { sender: 'user', text }]);
    this.currentMessage.set('');

    setTimeout(() => {
      this.messages.update((msgs) => [
        ...msgs,
        {
          sender: 'ai',
          text: `Processed query: "${text}". Adjusting your filters across our 110 active mandates.`,
        },
      ]);
    }, 1000);
  }

  async launch() {}
}

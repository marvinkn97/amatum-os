import { Component, signal, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-enrollment-view',
  standalone: true,
  imports: [],
  template: `
    <div
      class="min-h-screen bg-[#030712] text-slate-200 font-sans selection:bg-indigo-500/30 p-4 lg:p-8"
    >
      <!-- Top Navigation -->
      <nav
        class="sticky top-0 z-50 h-16 border-b border-white/5 bg-[#030712]/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8"
      >
        <!-- Left Side: Course Context -->
        <div class="flex items-center gap-4 md:gap-6 min-w-0">
          <button
            (click)="goBack()"
            class="flex items-center gap-3 text-slate-500 hover:text-white transition-all group cursor-pointer bg-transparent border-none p-0 outline-none shrink-0"
          >
            <div class="size-8 flex items-center justify-center transition-all">
              <svg
                class="size-4 group-hover:-translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="3.5"
              >
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <span class="hidden md:inline text-[10px] font-black uppercase tracking-[0.3em]"
              >Back</span
            >
          </button>

          <div class="h-5 w-px bg-white/5 hidden md:block"></div>

          <div class="flex flex-col min-w-0">
            <span
              class="text-[8px] font-black uppercase tracking-[0.4em] text-indigo-500 italic leading-none"
              >Course</span
            >
            <h1
              class="text-sm md:text-md font-black text-white uppercase italic tracking-tighter leading-none mt-1 truncate"
            >
              {{ courseTitle() }}
            </h1>
          </div>
        </div>

        <!-- Right Side: Improved Responsive Progress -->
        <div class="flex items-center gap-4 md:gap-8 shrink-0">
          <div class="flex flex-col items-end gap-1.5 animate-in fade-in duration-700">
            <!-- Progress Label -->
            <div class="flex items-center gap-2">
              <span class="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {{ progress() }}% <span class="hidden sm:inline">Complete</span>
              </span>
              
              <!-- Indicator Dot (Mobile/Tablet replacement for bar) -->
              <div class="md:hidden size-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
            </div>

            <!-- Progress Bar (Visible md+) -->
            <div class="hidden md:block w-32 lg:w-48 h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                class="h-full bg-linear-to-r from-indigo-600 to-violet-500 transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                [style.width.%]="progress()"
              ></div>
            </div>
          </div>
        </div>

        <!-- Mobile Progress Runner (Bottom border accent) -->
        <div class="absolute bottom-0 left-0 w-full h-px md:hidden">
            <div 
              class="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,1)] transition-all duration-1000"
              [style.width.%]="progress()"
            ></div>
        </div>
      </nav>

      <!-- Main Content Placeholder -->
      <main class="max-w-7xl mx-auto p-6 lg:p-10">
        <div
          class="aspect-video rounded-3xl border border-white/5 bg-white/2 flex items-center justify-center"
        >
          <p class="text-slate-500 font-medium tracking-wide">Course Content Area</p>
        </div>
      </main>
    </div>
  `,
})
export class EnrollmentViewComponent implements OnInit {
  courseTitle = signal<string>('Advanced AI Talent Ecosystems');
  progress = signal<number>(85); 
  private router = inject(Router);

  ngOnInit(): void {}

  goBack() {
    this.router.navigate(['/learner/course-catalogue']);
  }
}
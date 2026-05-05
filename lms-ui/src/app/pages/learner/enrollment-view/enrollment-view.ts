import { Component, signal, OnInit, inject, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  EnrollmentResponse,
  EnrollmentService,
  LearningStepDto,
} from '../../../services/enrollment.service';
import { finalize, map, Subject, takeUntil, filter } from 'rxjs';
import { NotificationService } from '../../../services/notification.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-enrollment-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- VIEWPORT WRAPPER: No browser scroll -->
    <div
      class="h-screen w-full bg-[#030712] text-slate-200 font-sans selection:bg-indigo-500/30 flex flex-col"
    >
      <!-- TOP NAVIGATION --> 
      <nav
      class="h-16 border-b border-white/5 bg-[#030712]/95 backdrop-blur-3xl flex items-center justify-between px-4 md:px-8 shrink-0 z-100 top-0 sticky"
      >
        <div class="flex items-center gap-4 md:gap-6 min-w-0">
          <button
            (click)="goBack()"
            class="flex items-center gap-3 text-slate-500 hover:text-white transition-all group cursor-pointer bg-transparent border-none p-0 outline-none shrink-0"
          >
            <div class="size-8 flex items-center justify-center">
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
          </button>

          <div class="h-5 w-px bg-white/5 hidden md:block"></div>

          <div class="flex flex-col min-w-0 cursor-pointer group" (click)="selectedStep.set(null)">
            <span
              class="text-[8px] font-black uppercase tracking-[0.4em] text-indigo-500 italic leading-none group-hover:text-indigo-400 transition-colors"
              >Course</span
            >
            <h1
              class="text-sm md:text-md font-black text-white uppercase italic tracking-tighter leading-none mt-1 truncate max-w-45 md:max-w-none"
            >
              {{ enrollment()?.course?.title }}
            </h1>
          </div>
        </div>

        <div class="flex items-center gap-6">
          <div class="hidden md:flex flex-col items-end">
            <span class="text-[8px] font-black text-slate-500 uppercase tracking-widest"
              >Completed</span
            >
            <span class="text-xs font-bold text-white italic tracking-tighter"
              >{{ completedStepsCount() }} / {{ totalStepsCount() }} STEPS</span
            >
          </div>
          <div class="relative size-10">
            <svg class="size-full -rotate-90 transform" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                class="stroke-white/10"
                stroke-width="3.5"
              />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                class="stroke-indigo-500 transition-all duration-1000 ease-out"
                stroke-width="3.5"
                [style.stroke-dasharray]="dashArray"
                stroke-linecap="round"
              />
            </svg>
            <div
              class="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white"
            >
              {{ enrollment()?.progress }}%
            </div>
          </div>
        </div>
      </nav>

      @if (isLoading()) {
        <div class="max-w-7xl mx-auto px-6 py-20 text-center">
          <div
            class="size-6 border-2 border-white/10 border-t-indigo-500 rounded-full animate-spin mx-auto"
          ></div>
        </div>
      } @else if (enrollment()) {
        <main class="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <!-- LEFT PANEL: Content & Dashboard -->
          <div class="flex-1 overflow-y-auto custom-scrollbar bg-[#030712] relative">
            @if (selectedStep()) {
              <div
                class="p-4 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto"
              >
                <button
                  (click)="selectedStep.set(null)"
                  class="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-indigo-500 transition-colors cursor-pointer border-none bg-transparent outline-none"
                >
                  <svg
                    class="size-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="4"
                  >
                    <path d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to overview
                </button>
                <div
                  class="aspect-video w-full rounded-4xl border border-white/5 bg-white/2 shadow-2xl overflow-hidden relative mb-10 group"
                >
                  <div
                    class="absolute inset-0 flex flex-col items-center justify-center bg-linear-to-br from-indigo-600/20 to-transparent"
                  >
                    <div
                      class="size-16 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center mb-4"
                    >
                      <svg
                        class="size-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2.5"
                      >
                        <path
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <h2
                  class="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase mb-6"
                >
                  {{ selectedStep()?.title }}
                </h2>
                <div
                  class="prose prose-invert max-w-none text-slate-400 leading-relaxed ql-editor"
                  [innerHTML]="selectedStep()?.content"
                ></div>
              </div>
            } @else {
              <div class="p-6 md:p-12 max-w-6xl animate-in fade-in duration-700">
                <!-- LAST ACTIVITY HERO -->
                @if (lastActivity(); as last) {
                  <div class="mb-12 group relative cursor-pointer" (click)="selectStep(last)">
                    <div
                      class="absolute -inset-4 bg-indigo-500/5 rounded-4xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                    ></div>

                    <div
                      class="relative bg-white/2 border border-white/5 rounded-2xl p-6 md:p-8 overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div class="flex items-center gap-5">
                        <!-- ICON/PLAY BUTTON -->
                        <div
                          class="size-11 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xl shadow-white/5 group-hover:scale-105 transition-transform"
                        >
                          <svg class="size-4 text-black ml-0.5 fill-current" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>

                        <div class="flex flex-col gap-1">
                          <span
                            class="text-[8px] font-black text-indigo-500 uppercase tracking-[0.3em]"
                          >
                            {{ enrollment()?.lastLearningStepId ? 'Resume Activity' : 'Up Next' }}
                          </span>
                          <h2
                            class="text-sm md:text-sm font-black text-white uppercase italic tracking-tighter leading-tight"
                          >
                            {{ last.title }}
                          </h2>
                        </div>
                      </div>

                      <!-- ACTION -->
                      <button
                        (click)="selectStep(last)"
                        class="px-5 py-2 bg-white/5 border border-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded-md hover:bg-white hover:text-black transition-all w-fit cursor-pointer"
                      >
                        {{ enrollment()?.lastLearningStepId ? 'Continue' : 'Start Learning' }}
                      </button>
                    </div>
                  </div>
                }

                <!-- COURSE INFO -->
                <section class="flex flex-col gap-6">
                  <h1
                    class="text-md md:text-md font-black text-white uppercase italic tracking-tighter leading-tight"
                  >
                    {{ enrollment()?.course?.title }}
                  </h1>
                  <div class="flex flex-wrap gap-2">
                    <span
                      class="px-2.5 py-1 bg-white/5 border border-white/10 text-[9px] font-black text-slate-500 uppercase tracking-widest rounded-md shrink-0"
                      >{{ enrollment()?.course?.modules?.length || 0 }} Modules</span
                    >
                    <span
                      class="px-2.5 py-1 bg-white/5 border border-white/10 text-[9px] font-black text-slate-500 uppercase tracking-widest rounded-md shrink-0"
                      >{{ totalStepsCount() }} Steps</span
                    >
                    <span
                      class="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-500 uppercase tracking-widest rounded-md shrink-0"
                      >{{ enrollment()?.progress }}% Overall Progress</span
                    >
                  </div>
                  <div
                    class="ql-editor prose prose-invert max-w-none text-slate-400 leading-relaxed"
                    [innerHTML]="safeDescription"
                  ></div>
                </section>
              </div>
            }
          </div>

          <!-- RIGHT PANEL: Sidebar -->
          <aside class="w-full lg:w-96 bg-[#030712] border-l border-white/5 flex flex-col shrink-0">
            <div
              class="p-6 border-b border-white/5 flex items-center justify-between bg-[#030712]/80 backdrop-blur-md shrink-0"
            >
              <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                Course Content
              </h3>
              <span class="px-2 py-0.5 bg-white/5 rounded text-[9px] font-black text-indigo-500"
                >{{ enrollment()?.progress }}%</span
              >
            </div>

            <div class="flex-1 overflow-y-auto custom-scrollbar divide-y divide-white/5">
              @for (module of enrollment()?.course?.modules; track module.id; let i = $index) {
                <div class="group">
                  <button
                    (click)="toggleModule(module.id)"
                    class="w-full p-6 flex items-center justify-between hover:bg-white/3 transition-all text-left outline-none border-none cursor-pointer"
                  >
                    <div class="flex items-center gap-4">
                      <span
                        class="text-sm font-black italic transition-colors"
                        [class]="isExpanded(module.id) ? 'text-indigo-500' : 'text-white/10'"
                        >0{{ i + 1 }}</span
                      >
                      <span class="text-[11px] font-bold text-white uppercase tracking-tight">{{
                        module.title
                      }}</span>
                    </div>
                    <svg
                      class="size-4 text-slate-600 transition-transform duration-500"
                      [class.rotate-180]="isExpanded(module.id)"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path stroke-width="3" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <div
                    class="overflow-hidden transition-all duration-500 ease-in-out"
                    [style.max-height]="isExpanded(module.id) ? '2000px' : '0px'"
                  >
                    <div class="bg-white/2 pb-4">
                      @for (step of module.learningSteps; track step.id) {
                        <div
                          (click)="selectStep(step)"
                          class="group/step flex items-center justify-between px-8 py-4 hover:bg-indigo-500/5 cursor-pointer transition-all border-l-2 border-transparent"
                          [class.border-indigo-500]="selectedStep()?.id === step.id"
                          [class.bg-indigo-500/5]="selectedStep()?.id === step.id"
                        >
                          <div class="flex items-center gap-4">
                            <div
                              class="size-5 rounded-md border-2 transition-all flex items-center justify-center shrink-0"
                              [class]="
                                step.isCompleted
                                  ? 'bg-indigo-500 border-indigo-500'
                                  : 'border-white/10 group-hover/step:border-indigo-500'
                              "
                            >
                              @if (step.isCompleted) {
                                <svg
                                  class="size-3 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  stroke-width="4"
                                >
                                  <path d="M5 13l4 4L19 7" />
                                </svg>
                              }
                            </div>
                            <span
                              class="text-[11px] font-bold tracking-tight transition-colors"
                              [class]="
                                selectedStep()?.id === step.id
                                  ? 'text-white'
                                  : 'text-slate-400 group-hover/step:text-white'
                              "
                              >{{ step.title }}</span
                            >
                          </div>
                          <span class="text-[8px] font-black text-slate-700 uppercase italic">{{
                            step.type
                          }}</span>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          </aside>
        </main>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
        overflow: hidden;
      }
      .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      .ql-editor p {
        margin: 0.75rem 0;
      }
      .ql-editor ul {
        padding-left: 1.5rem;
        list-style-type: disc;
      }
      .ql-editor li {
        margin: 0.25rem 0;
      }
      .ql-editor {
        line-height: 1.7;
        font-size: 14px;
      }
    `,
  ],
})
export class EnrollmentViewComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private enrollmentService = inject(EnrollmentService);
  private notificationService = inject(NotificationService);
  private sanitizer = inject(DomSanitizer);

  enrollment = signal<EnrollmentResponse | null>(null);
  isLoading = signal(true);
  selectedStep = signal<LearningStepDto | null>(null);
  expandedModuleIds = signal<Set<string>>(new Set());

  safeDescription: SafeHtml = '';
  private destroy$ = new Subject<void>();

  totalStepsCount = computed(() => {
    return (
      this.enrollment()?.course?.modules?.reduce(
        (acc, mod) => acc + (mod.learningSteps?.length || 0),
        0,
      ) || 0
    );
  });

  completedStepsCount = computed(() => {
    let count = 0;
    this.enrollment()?.course?.modules?.forEach((mod) => {
      count += mod.learningSteps?.filter((s) => s.isCompleted).length || 0;
    });
    return count;
  });

  lastActivity = computed(() => {
    const enrollment = this.enrollment();
    if (!enrollment) return null;

    // 1. If backend gave us a bookmark, find that specific step
    if (enrollment.lastLearningStepId) {
      for (const mod of enrollment.course.modules) {
        const step = mod.learningSteps.find((s) => s.id === enrollment.lastLearningStepId);
        if (step) return step;
      }
    }

    // 2. Fallback: Return the first step of the first module
    return enrollment.course.modules[0]?.learningSteps[0] || null;
  });

  ngOnInit() {
    this.route.paramMap
      .pipe(
        map((p) => p.get('id')),
        filter((id) => !!id),
        takeUntil(this.destroy$),
      )
      .subscribe((id) => this.loadEnrollment(id!));
  }

  private loadEnrollment(id: string) {
    this.isLoading.set(true);
    this.enrollmentService
      .getEnrollmentById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.enrollment.set(data);
          this.safeDescription = this.sanitizer.bypassSecurityTrustHtml(
            data.course.description || '',
          );
          if (data.course.modules?.length > 0) this.toggleModule(data.course.modules[0].id);
        },
        error: () => this.notificationService.error('Failed to load'),
      });
  }

  selectStep(step: LearningStepDto) {
    this.selectedStep.set(step);
    // Find the left scrollable panel specifically
    const leftPanel = document.querySelector('.flex-1.overflow-y-auto');
    leftPanel?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleModule(id: string) {
    this.expandedModuleIds.update((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  isExpanded(id: string): boolean {
    return this.expandedModuleIds().has(id);
  }

  get dashArray(): string {
    const progress = this.enrollment()?.progress ?? 0;
    const circumference = 2 * Math.PI * 16;
    return `${(progress / 100) * circumference}, ${circumference}`;
  }

  goBack() {
    this.router.navigate(['/learner/enrollments']);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

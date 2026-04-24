import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CourseService, CourseResponse } from '../../../services/course.service';
import { filter, finalize, map, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { TenantService } from '../../../services/tenant.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { EnrollmentRequest, EnrollmentService } from '../../../services/enrollment.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-[#030712] text-slate-200 font-sans selection:bg-indigo-500/30">
      <nav
        class="h-16 border-b border-white/5 bg-[#030712]/80 backdrop-blur-3xl sticky top-0 z-100 px-4 md:px-8"
      >
        <div class="max-w-7xl mx-auto h-full flex items-center justify-between">
          <div class="flex items-center gap-4 md:gap-6">
            <button
              (click)="goBack()"
              class="flex items-center gap-3 text-slate-500 hover:text-white transition-all group cursor-pointer bg-transparent border-none p-0 outline-none"
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

            <div class="flex flex-col">
              <span
                class="text-[8px] font-black uppercase tracking-[0.4em] text-indigo-500 italic leading-none"
                >Course</span
              >
              <h1
                class="text-sm md:text-md font-black text-white uppercase italic tracking-tighter leading-none mt-1 truncate max-w-50 md:max-w-none"
              >
                {{ course()?.title }}
              </h1>
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
      } @else if (course()) {
        <div
          class="max-w-7xl mx-auto px-6 md:px-8 pt-10 md:pt-16 pb-20 animate-in fade-in duration-700"
        >
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div class="lg:col-span-7 space-y-12 md:space-y-16 order-2 lg:order-1">
              <section class="flex flex-col gap-6">
                <h1
                  class="text-md md:text-lg font-black text-white uppercase italic tracking-tighter leading-tight wrap-break-word"
                >
                  {{ course()!.title }}
                </h1>
                <div class="flex flex-wrap gap-2">
                  <span
                    class="px-2.5 py-1 bg-white/5 border border-white/10 text-[9px] font-black text-slate-500 uppercase tracking-widest rounded-md shrink-0"
                  >
                    {{ course()?.moduleCount || 0 }} Modules
                  </span>
                  <span
                    class="px-2.5 py-1 bg-white/5 border border-white/10 text-[9px] font-black text-slate-500 uppercase tracking-widest rounded-md shrink-0"
                  >
                    {{ course()?.learningStepCount }} Steps
                  </span>
                </div>
                <div
                  class="flex flex-col text-slate-400 text-[13px] font-medium leading-relaxed border-l border-white/10 pl-5 md:pl-8 py-1 wrap-break-word overflow-hidden"
                  [innerHTML]="course()!.description"
                ></div>
              </section>

              <section class="space-y-8 pt-6">
                <h2
                  class="text-[11px] font-black text-white italic tracking-widest uppercase border-b border-white/5 pb-4"
                >
                  Content
                </h2>
                <div class="grid gap-3">
                  @for (module of course()!.modules; track module.id; let i = $index) {
                    <div
                      class="bg-white/2 border border-white/5 rounded-2xl overflow-hidden transition-all duration-500"
                      [class.border-white/10]="isExpanded(module.id)"
                    >
                      <button
                        (click)="toggleModule(module.id)"
                        class="w-full px-5 md:px-6 py-4 md:py-5 flex items-center justify-between hover:bg-white/3 transition-colors group cursor-pointer text-left border-none outline-none"
                      >
                        <div class="flex items-center gap-4 pr-4">
                          <span
                            class="text-base md:text-lg font-black italic transition-colors shrink-0"
                            [class]="
                              isExpanded(module.id) ? 'text-indigo-500' : 'text-indigo-500/20'
                            "
                          >
                            0{{ i + 1 }}
                          </span>
                          <h3
                            class="text-[11px] md:text-[12px] font-bold text-white tracking-tight wrap-break-word"
                          >
                            {{ module.title }}
                          </h3>
                        </div>
                        <div
                          class="size-6 shrink-0 flex items-center justify-center transition-transform duration-300"
                          [class.rotate-180]="isExpanded(module.id)"
                        >
                          <svg
                            class="size-4 text-slate-500 group-hover:text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="3"
                          >
                            <path d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      <div
                        class="grid transition-all duration-500 ease-in-out"
                        [style.grid-template-rows]="isExpanded(module.id) ? '1fr' : '0fr'"
                      >
                        <div class="overflow-hidden">
                          <div class="px-5 md:px-6 pb-6 pt-2 divide-y divide-white/5">
                            @for (step of module.learningSteps; track step.id) {
                              <div class="flex items-center justify-between py-4 group/step gap-4">
                                <div class="flex items-center gap-4">
                                  <div
                                    class="size-1.5 rounded-full shrink-0"
                                    [class]="
                                      step.type === 'LESSON' ? 'bg-indigo-500' : 'bg-amber-500'
                                    "
                                  ></div>
                                  <span
                                    class="text-[11px] font-medium text-slate-400 group-hover/step:text-white transition-colors tracking-tight wrap-break-word"
                                    >{{ step.title }}</span
                                  >
                                </div>
                                <span
                                  class="text-[9px] font-black text-slate-700 uppercase tracking-widest italic shrink-0"
                                  >{{ step.type }}</span
                                >
                              </div>
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </section>
            </div>

            <div class="lg:col-span-4 order-1 lg:order-2">
              <div class="lg:sticky lg:top-32">
                <div
                  class="bg-white/2 border border-white/5 rounded-md md:rounded-[2.5rem] p-8 md:p-10 backdrop-blur-3xl relative overflow-hidden"
                >
                  <div
                    class="absolute -top-24 -right-24 size-64 bg-indigo-600/5 blur-[100px]"
                  ></div>

                  <div class="relative z-10 space-y-8 md:space-y-10">
                    <div class="space-y-4">
                      <span
                        class="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] block italic leading-none"
                        >Registration</span
                      >
                      <div class="flex items-center">
                        @if (course()?.accessTier === 'FREE') {
                          <span
                            class="text-[11px] font-black italic text-white uppercase tracking-tighter leading-none"
                            >Free Access</span
                          >
                        } @else {
                          <div class="flex items-center gap-3">
                            <span
                              class="text-[8px] font-black text-indigo-500 uppercase tracking-[0.2em] leading-none"
                              >Premium</span
                            >
                            <span
                              class="text-[11px] font-black italic text-white uppercase tracking-tighter leading-none"
                              >{{ '$' + course()?.price }}</span
                            >
                          </div>
                        }
                      </div>
                    </div>

                    <button
                      (click)="enroll()"
                      [disabled]="course()?.isEnrolled || isEnrolling()"
                      class="w-full py-5 rounded-2xl font-black uppercase tracking-[0.25em] text-[10px] transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-3 border-none outline-none disabled:cursor-not-allowed"
                      [ngClass]="
                        course()?.isEnrolled
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : isEnrolling()
                            ? 'bg-slate-800 text-slate-500 border border-white/5 opacity-50'
                            : 'bg-white text-black hover:bg-indigo-600 hover:text-white shadow-2xl shadow-indigo-500/40'
                      "
                    >
                      <span>
                        {{
                          isEnrolling()
                            ? 'Verifying...'
                            : course()?.isEnrolled
                              ? 'Enrolled'
                              : 'Enroll Now'
                        }}
                      </span>

                      @if (course()?.isEnrolled) {
                        <svg class="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="3"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      } @else if (!isEnrolling()) {
                        <svg class="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-width="4" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      /* Force hide scrollbars globally via deep piercing */
      ::ng-deep html,
      ::ng-deep body {
        scrollbar-width: thin !important;
        scrollbar-color: rgba(255, 255, 255, 0.05) transparent !important;
        background-color: #030712;
      }

      ::ng-deep ::-webkit-scrollbar {
        width: 4px !important;
      }

      ::ng-deep ::-webkit-scrollbar-track {
        background: transparent !important;
      }

      ::ng-deep ::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.05) !important;
        border-radius: 10px !important;
      }

      ::ng-deep ::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.15) !important;
      }

      :host {
        display: block;
      }
    `,
  ],
})
export class CourseDetailsComponent implements OnInit {
  private courseService = inject(CourseService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tenantService = inject(TenantService);
  private enrollmentService = inject(EnrollmentService);
  private notificationService = inject(NotificationService);

  course = signal<CourseResponse | null>(null);
  isLoading = signal(true);
  isEnrolling = signal(false);

  expandedModuleIds = signal<Set<string>>(new Set());

  private destroy$ = new Subject<void>();

  private tenant$ = toObservable(this.tenantService.tenantId);

  ngOnInit() {
    this.route.paramMap
      .pipe(
        map((params) => params.get('id')),
        // 1. Only proceed if we have an ID in the URL
        filter((id) => !!id),
        tap(() => {
          this.isLoading.set(true);
          this.course.set(null);
        }),
        switchMap((id) => {
          // 2. Peek at the current tenant ID from the service
          const currentTenant = this.tenantService.tenantId();

          // 3. Perform the fetch
          return this.courseService
            .getCourseById(id!)
            .pipe(finalize(() => this.isLoading.set(false)));
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (data) => {
          this.course.set(data);
          if (data?.modules?.length) this.toggleModule(data.modules[0].id);
        },
        error: (err) => {
          console.error('Fetch failed:', err);
          this.isLoading.set(false);
          this.notificationService.error('Failed to load course');
        },
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCourse(id: string) {
    this.isLoading.set(true); // ← important: reset loading
    this.course.set(null);

    this.courseService
      .getCourseById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.course.set(data);
          if (data.modules?.length) this.toggleModule(data.modules[0].id);
        },
        error: (err) => {
          console.error(err);
          this.course.set(null);
          this.notificationService.error('Failed to load course');

        },
      });
  }

  isExpanded(id: string): boolean {
    return this.expandedModuleIds().has(id);
  }

  toggleModule(id: string) {
    this.expandedModuleIds.update((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  goBack() {
    this.router.navigate(['/learner/course-catalogue']);
  }

  enroll() {
    const currentCourse = this.course();
    if (!currentCourse || currentCourse.isEnrolled || this.isEnrolling()) return;

    this.isEnrolling.set(true);

    // Use the specific interface your backend expects
    const request: EnrollmentRequest = { courseId: currentCourse.id };

    this.enrollmentService
      .enroll(request)
      .pipe(
        // CRITICAL: We fetch the course again to get the verified truth from DB
        switchMap(() => this.courseService.getCourseById(currentCourse.id)),
        finalize(() => this.isEnrolling.set(false)),
      )
      .subscribe({
        next: (refreshedCourse) => {
            this.notificationService.success('Enrolled to course successfully');
          // The signal is now updated with data verified by the backend
          this.course.set(refreshedCourse);
        },
        error: (err) => {
          console.error('Enrollment failed:', err);
          this.notificationService.error(err?.error?.detail || 'Enrollment failed');
          // UI stays safe; signal remains unchanged
        },
      });
  }
}

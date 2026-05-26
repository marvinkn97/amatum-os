import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CourseService, CourseResponse } from '../../../services/course.service';
import { filter, finalize, map, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-explore-course',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div
      class="min-h-screen bg-[#030712] text-slate-200 font-sans selection:bg-indigo-500/30 p-4 lg:p-8"
    >
      <nav
        class="h-16 border-b border-white/5 bg-[#030712]/95 backdrop-blur-3xl sticky top-0 z-100 px-4 md:px-8"
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
            <div class="lg:col-span-7 lg:col-start-3 space-y-12 md:space-y-16 order-2 lg:order-1">
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
                  class="ql-editor prose prose-invert max-w-none text-slate-300 leading-relaxed"
                  [innerHTML]="safeDescription"
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
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
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
export class ExploreCourse implements OnInit, OnDestroy {
  private courseService = inject(CourseService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private notificationService = inject(NotificationService);

  course = signal<CourseResponse | null>(null);
  isLoading = signal(true);
  expandedModuleIds = signal<Set<string>>(new Set());
  safeDescription!: SafeHtml;

  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.route.paramMap
      .pipe(
        map((params) => params.get('id')),
        filter((id) => !!id),
        tap(() => {
          this.isLoading.set(true);
          this.course.set(null);
        }),
        switchMap((id) =>
          this.courseService
            .getPublicCourseView(id!)
            .pipe(finalize(() => this.isLoading.set(false)))
        ),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data) => {
          this.course.set(data);
          this.safeDescription = this.sanitizer.bypassSecurityTrustHtml(data?.description ?? '');
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
    this.router.navigate(['/explore']);
  }
}
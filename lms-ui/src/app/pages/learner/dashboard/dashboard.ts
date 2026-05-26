import {
  Component,
  signal,
  computed,
  effect,
  inject,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit,
  untracked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import {
  EnrollmentService,
  EnrollmentResponse,
  DashboardCounters,
} from '../../../services/enrollment.service';
import { TenantService } from '../../../services/tenant.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-learner-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isLoading()) {
      <div class="max-w-7xl mx-auto px-6 py-20 text-center">
        <div
          class="size-6 border-2 border-white/10 border-t-indigo-500 rounded-full animate-spin mx-auto"
        ></div>
      </div>
    } @else {
      <div
        class="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20 p-4 lg:p-8 text-white"
      >
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            class="bg-white/1 border border-white/5 p-8 rounded-2xl flex flex-col justify-between min-h-36"
          >
            <span class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]"
              >Active Courses</span
            >
            <span class="text-4xl font-light tracking-tight mt-4  text-indigo-400">
              {{ counters()?.activeCount ?? 0 }}
            </span>
          </div>
          <div
            class="bg-white/1 border border-white/5 p-8 rounded-2xl flex flex-col justify-between min-h-36"
          >
            <span class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]"
              >Completed Courses</span
            >
            <span class="text-4xl font-light tracking-tight mt-4 text-indigo-400">
              {{ counters()?.completedCount ?? 0 }}
            </span>
          </div>
          <div
            class="bg-white/1 border border-white/5 p-8 rounded-2xl flex flex-col justify-between min-h-36"
          >
            <span class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]"
              >Certifications</span
            >
            <span class="text-4xl font-light tracking-tight mt-4  text-indigo-400">
              {{ counters()?.certificateCount ?? 0 }}
            </span>
          </div>
        </div>

        <div class="space-y-4">
          <div class="px-2 border-b border-white/5 pb-4">
            <h2 class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              My Learning
            </h2>
          </div>

          <div class="bg-white/1 border border-white/5 rounded-2xl overflow-hidden">
            <div class="max-h-145 overflow-y-auto custom-scrollbar pr-1">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr
                    class="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] border-b border-white/5 bg-[#030712]/40 sticky top-0 backdrop-blur-md z-10"
                  >
                    <th class="px-10 py-6">Course</th>
                    <th class="px-10 py-6">Last Activity</th>
                    <th class="px-10 py-6">Progress</th>
                    <th class="px-10 py-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  @for (enrollment of enrollments(); track enrollment.id) {
                    <tr class="group hover:bg-white/2 transition-all">
                      <td class="px-10 py-7">
                        <span
                          class="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors leading-tight block"
                        >
                          {{ enrollment.course.title }}
                        </span>
                      </td>

                      <td class="px-10 py-7">
                        <span class="text-xs font-medium text-slate-400 font-mono">
                          {{ enrollment.lastActivityAt | date: 'mediumDate' }}
                        </span>
                      </td>

                      <td class="px-10 py-7">
                        <div class="w-44 space-y-2">
                          <div
                            class="flex justify-between text-[10px] font-bold tracking-tight text-slate-500 font-mono"
                          >
                            <span>COMPLETION</span>
                            <span class="text-slate-300">{{ enrollment.progress }}%</span>
                          </div>
                          <div class="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div
                              class="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all duration-1000"
                              [style.width.%]="enrollment.progress"
                            ></div>
                          </div>
                        </div>
                      </td>

                      <td class="px-10 py-7 text-right">
                        <button
                          (click)="openEnrollment(enrollment.id)"
                          class="size-10 bg-white/3 border border-white/10 rounded-xl inline-flex items-center justify-center text-slate-400 hover:bg-white hover:text-black hover:scale-105 transition-all cursor-pointer"
                        >
                          <svg
                            class="size-4.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="2.5"
                          >
                            <path d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  }

                  @if (enrollments().length === 0) {
                    <tr>
                      <td colspan="4" class="px-10 py-16 text-center">
                        <span
                          class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500"
                          >No Active Courses</span
                        >
                      </td>
                    </tr>
                  }

                  <tr class="border-none!">
                    <td colspan="4" class="p-0 border-none!">
                      <div #scrollSentinel class="h-4 w-full pointer-events-none"></div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class LearnerDashboardComponent implements OnInit, AfterViewInit {
  private enrollmentService = inject(EnrollmentService);
  private tenantService = inject(TenantService);
  private router = inject(Router);

  @ViewChild('scrollSentinel') scrollSentinel!: ElementRef;

  counters = signal<DashboardCounters | null>(null);
  enrollments = signal<EnrollmentResponse[]>([]);
  currentPage = signal<number>(0);
  hasNextPage = signal<boolean>(true);

  // Discrete signals for each request state
  isCountersLoading = signal<boolean>(false);
  isEnrollmentsLoading = signal<boolean>(false);

  // Computed state evaluates true if either request is pending execution
  isLoading = computed(() => this.isCountersLoading() || this.isEnrollmentsLoading());

  private readonly PAGE_SIZE = 10;

  constructor() {
    effect(() => {
      this.tenantService.tenantId();
      untracked(() => this.resetAndReload());
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
  // Check if the element was actually found in the DOM
  if (!this.scrollSentinel) {
    return; 
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !this.isLoading() && this.hasNextPage()) {
        untracked(() => {
          this.currentPage.update((p) => p + 1);
          this.loadActiveData(false);
        });
      }
    },
    { threshold: 0.1 },
  );

  observer.observe(this.scrollSentinel.nativeElement);
}

  private resetAndReload(): void {
    this.currentPage.set(0);
    this.hasNextPage.set(true);
    this.enrollments.set([]);

    this.fetchCounters();
    this.loadActiveData(true);
  }

  fetchCounters(): void {
    this.isCountersLoading.set(true);
    this.enrollmentService
      .getDashboardCounters()
      .pipe(finalize(() => this.isCountersLoading.set(false)))
      .subscribe({
        next: (data) => this.counters.set(data),
        error: (err) => console.error('Failed to update counter snapshot analytics', err),
      });
  }

  private loadActiveData(reset: boolean): void {
    this.isEnrollmentsLoading.set(true);
    this.enrollmentService
      .getActiveEnrollments(this.currentPage(), this.PAGE_SIZE)
      .pipe(finalize(() => this.isEnrollmentsLoading.set(false)))
      .subscribe({
        next: (response: any) => {
          const items = response?._embedded?.enrollmentResponseList || [];

          if (reset) {
            this.enrollments.set(items);
          } else {
            this.enrollments.update((curr) => [...curr, ...items]);
          }

          if (response?.page) {
            this.hasNextPage.set(response.page.number < response.page.totalPages - 1);
          } else {
            this.hasNextPage.set(items.length === this.PAGE_SIZE);
          }
        },
        error: (err) => {
          console.error('Failed to load active courses', err);
          this.hasNextPage.set(false);
          if (reset) this.enrollments.set([]);
        },
      });
  }

  openEnrollment(id: string): void {
    if (!id) {
      return;
    }
    this.router.navigate(['/learner/enrollments', id]);
  }
}

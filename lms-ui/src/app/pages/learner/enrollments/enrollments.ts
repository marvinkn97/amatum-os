import {
  Component,
  signal,
  HostListener,
  effect,
  inject,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit,
  untracked,
} from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { EnrollmentService } from '../../../services/enrollment.service';
import { NotificationService } from '../../../services/notification.service';
import { TenantService } from '../../../services/tenant.service';
import { Loader } from '../../../components/loader/loader';

@Component({
  selector: 'app-enrollments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Loader],
  template: `
    <div class="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 p-4 lg:p-8 pb-20 px-6">
      <!-- Header -->
      <header
        class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10"
      >
        <div>
          <h1 class="text-md font-black text-white italic tracking-tighter mb-2 uppercase">
            My Learning
          </h1>
          <p class="text-slate-500 text-sm font-medium">
            Track your progress and continue your learning journey.
          </p>
        </div>
      </header>

      <!-- Tabs -->
      <div class="flex items-center gap-4">
        <div class="flex p-1 bg-white/5 border border-white/10 rounded-xl backdrop-blur-3xl">
          <button
            (click)="viewMode.set('active')"
            [class]="
              viewMode() === 'active' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'
            "
            class="px-6 py-2 rounded-lg text-[12px] font-black uppercase tracking-widest transition-all cursor-pointer"
          >
            Active
          </button>
          <button
            (click)="viewMode.set('completed')"
            [class]="
              viewMode() === 'completed' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'
            "
            class="px-6 py-2 rounded-lg text-[12px] font-black uppercase tracking-widest transition-all cursor-pointer"
          >
            Completed
          </button>
        </div>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
        @for (enrollment of enrollments(); track enrollment?.id) {
          <div
            class="group bg-white/2 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-indigo-500/40 transition-all duration-500 flex flex-col backdrop-blur-md"
          >
            <!-- Decorative Header (Thumbnail-like section) -->
            <div [class]="'h-32 relative ' + getAccent(enrollment?.id)">
              <div class="absolute inset-0 bg-linear-to-t from-[#030712] to-transparent"></div>
            </div>

            <div class="p-8 pt-6 flex flex-col flex-1">
              <h3
                class="text-md font-black text-white mb-8 italic tracking-tighter leading-tight group-hover:text-indigo-400 transition-colors uppercase"
              >
                {{ enrollment?.course?.title }}
              </h3>

              <!-- Progress Showcase -->
              <div class="space-y-4 mb-10">
                <div class="flex items-center justify-between">
                  <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest"
                    >Progress</span
                  >
                  <span class="text-[10px] font-black text-white italic"
                    >{{ enrollment?.progress }}%</span
                  >
                </div>
                <div class="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5">
                  <div
                    class="h-full bg-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                    [style.width.%]="enrollment?.progress"
                  ></div>
                </div>
              </div>

              <!-- Footer -->
              <div class="mt-auto pt-6 flex items-center justify-between border-t border-white/5">
                <div class="flex flex-col">
                  <span class="text-[7px] font-black text-slate-600 uppercase tracking-widest mb-1"
                    >Last Activity</span
                  >
                  <span class="text-[10px] text-white font-bold italic uppercase">{{
                    enrollment?.lastActivityAt | date: 'MMM d, y'
                  }}</span>
                </div>

                <a
                  [routerLink]="['/learner/enrollments', enrollment.id]"
                  class="size-11 bg-white/5 border border-white/10 text-slate-500 rounded-2xl flex items-center justify-center hover:bg-white/10 hover:text-white transition-all active:scale-90 cursor-pointer"
                  title="Open Enrollment"
                >
                  <svg
                    class="size-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        } @empty {
          @if (!isLoading()) {
            <div
              class="col-span-full py-32 border border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center text-center"
            >
              <span class="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]"
                >No Courses Found</span
              >
            </div>
          }
        }

        <!-- SKELETONS -->
        @if (isLoading()) {
          @for (i of [1, 2, 3]; track i) {
            <app-loader type="skeleton-card" />
          }
        }
      </div>

      <div #scrollSentinel class="h-20 w-full"></div>

      <!-- Back to Top -->
      <button
        (click)="scrollToTop()"
        [class.opacity-100]="showBackToTop()"
        [class.translate-y-0]="showBackToTop()"
        [class.opacity-0]="!showBackToTop()"
        [class.translate-y-10]="!showBackToTop()"
        class="fixed bottom-10 right-10 size-12 bg-white text-black rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 hover:bg-indigo-600 hover:text-white active:scale-90 z-50 cursor-pointer"
      >
        <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-width="3" d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </div>
  `,
})
export class EnrollmentsComponent implements OnInit, AfterViewInit {
  private enrollmentService = inject(EnrollmentService);
  private scroller = inject(ViewportScroller);
  private notificationService = inject(NotificationService);
  private tenantService = inject(TenantService);

  @ViewChild('scrollSentinel') scrollSentinel!: ElementRef;

  viewMode = signal<'active' | 'completed'>('active');
  enrollments = signal<any[]>([]);
  currentPage = signal(0);
  hasNextPage = signal(true);
  isLoading = signal(false);
  showBackToTop = signal(false);
  today = new Date();

  constructor() {
    effect(() => {
      this.viewMode();

      this.tenantService.tenantId();

      untracked(() => this.resetAndReload());
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit() {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.isLoading() && this.hasNextPage()) {
          untracked(() => {
            this.currentPage.update((p) => p + 1);
            this.loadData(false);
          });
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(this.scrollSentinel.nativeElement);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showBackToTop.set(window.pageYOffset > 500);
  }

  private resetAndReload() {
    this.currentPage.set(0);
    this.hasNextPage.set(true);
    this.enrollments.set([]);
    this.loadData(true);
  }

  private loadData(reset: boolean) {
    if (this.isLoading()) return;
    this.isLoading.set(true);

    const request =
      this.viewMode() === 'active'
        ? this.enrollmentService.getActiveEnrollments(this.currentPage(), 10)
        : this.enrollmentService.getCompletedEnrollments(this.currentPage(), 10);

    request.pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: (response: any) => {
        const list = response._embedded?.enrollmentResponseList || [];
        if (reset) this.enrollments.set(list);
        else this.enrollments.update((curr) => [...curr, ...list]);
        this.hasNextPage.set(response.page.number < response.page.totalPages - 1);
      },
      error: () => {
        this.hasNextPage.set(false);
        if (reset) this.enrollments.set([]);
        this.notificationService.error('Failed to load your courses. Please try again later.');
      },
    });
  }

  getAccent(id: string): string {
    const accents = ['bg-emerald-500/10', 'bg-indigo-500/10', 'bg-rose-500/10', 'bg-amber-500/10'];
    const index = id ? id.charCodeAt(id.length - 1) % accents.length : 0;
    return accents[index];
  }

  scrollToTop() {
    this.scroller.scrollToPosition([0, 0]);
  }
}

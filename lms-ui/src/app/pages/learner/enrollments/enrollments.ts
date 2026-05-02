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

@Component({
  selector: 'app-enrollments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 p-4 lg:p-8 pb-20 px-6">
      <!-- Header: Matched to ManagerCourses -->
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

      <!-- Tabs: Matched to ManagerCourses -->
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
        @for (enrollment of enrollments(); track enrollment.id) {
          <div
            class="group bg-white/2 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-indigo-500/40 transition-all duration-500 flex flex-col backdrop-blur-md"
          >
            <div [class]="'h-40 relative ' + getAccent(enrollment.courseId)">
              <div class="absolute inset-0 bg-linear-to-t from-[#030712] to-transparent"></div>

              <!-- Progress Indicator -->
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-5xl font-black text-white/10 italic tracking-tighter"
                  >{{ enrollment.progressPercent }}%</span
                >
              </div>

              <div class="absolute top-6 right-8">
                <span
                  class="px-3 py-1 rounded-lg bg-black/40 border border-white/10 text-[8px] font-black uppercase tracking-widest text-white flex items-center gap-2"
                >
                  <div
                    class="size-1 rounded-full bg-indigo-400"
                    [class.animate-pulse]="viewMode() === 'active'"
                  ></div>
                  {{ viewMode() === 'active' ? 'In Progress' : 'Completed' }}
                </span>
              </div>
            </div>

            <div class="p-8 pt-4 flex flex-col flex-1">
              <div class="flex items-center gap-2 mb-4">
                <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                  {{ enrollment.completedSteps }} / {{ enrollment.totalSteps }} Lessons
                </span>
              </div>

              <h3
                class="text-md font-black text-white mb-6 italic tracking-tighter leading-tight group-hover:text-indigo-400 transition-colors uppercase"
              >
                {{ enrollment.courseTitle }}
              </h3>

              <!-- Progress Bar -->
              <div class="space-y-3 mb-8">
                <div class="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                    [style.width.%]="enrollment.progressPercent"
                  ></div>
                </div>
              </div>

              <div class="mt-auto pt-6 flex items-center justify-between border-t border-white/5">
                <div class="flex flex-col">
                  <span class="text-[7px] font-black text-slate-600 uppercase tracking-widest mb-1"
                    >Last Activity</span
                  >
                  <span class="text-[10px] text-white font-bold italic">{{
                    enrollment.lastAccessed | date: 'MMM d, y'
                  }}</span>
                </div>

                <a
                  [routerLink]="['/learner/player', enrollment.courseId]"
                  class="h-11 px-6 bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black rounded-2xl flex items-center justify-center transition-all active:scale-95 font-black uppercase text-[10px] tracking-widest cursor-pointer"
                >
                  {{ viewMode() === 'active' ? 'Resume' : 'Review' }}
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

        <!-- Loading Skeletons -->
        @if (isLoading()) {
          @for (i of [1, 2, 3]; track i) {
            <div class="bg-white/2 border border-white/5 rounded-[2.5rem] h-96 animate-pulse"></div>
          }
        }
      </div>

      <div #scrollSentinel class="h-20 w-full"></div>
    </div>
  `,
})
export class EnrollmentsComponent implements OnInit, AfterViewInit {
  private enrollmentService = inject(EnrollmentService);
  private scroller = inject(ViewportScroller);

  @ViewChild('scrollSentinel') scrollSentinel!: ElementRef;

  // Signals matching ManagerCourses logic
  viewMode = signal<'active' | 'completed'>('active');
  searchQuery = signal('');
  enrollments = signal<any[]>([]);
  currentPage = signal(0);
  hasNextPage = signal(true);
  isLoading = signal(false);

  constructor() {
    effect(() => {
      // Trigger reset whenever filtering parameters change
      this.viewMode();
      this.searchQuery();
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

  private resetAndReload() {
    this.currentPage.set(0);
    this.hasNextPage.set(true);
    this.enrollments.set([]);
    this.loadData(true);
  }

  private loadData(reset: boolean) {
    if (this.isLoading()) return;
    this.isLoading.set(true);

    // Call API with status (active/completed), query, and page
    // this.enrollmentService
    //   .fetchMyEnrollments(this.viewMode(), this.searchQuery(), this.currentPage())
    //   .pipe(finalize(() => this.isLoading.set(false)))
    //   .subscribe({
    //     next: (response: any) => {
    //       const list = response._embedded?.enrollmentResponseList || [];
    //       if (reset) this.enrollments.set(list);
    //       else this.enrollments.update((curr) => [...curr, ...list]);
    //       this.hasNextPage.set(response.page.number < response.page.totalPages - 1);
    //     },
    //     error: () => {
    //       this.hasNextPage.set(false);
    //       if (reset) this.enrollments.set([]);
    //     },
    //   });
  }

  getAccent(id: string): string {
    const accents = ['bg-emerald-500/10', 'bg-indigo-500/10', 'bg-rose-500/10', 'bg-amber-500/10'];
    const index = id ? id.length % accents.length : 0;
    return accents[index];
  }
}

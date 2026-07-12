import {
  Component,
  signal,
  computed,
  inject,
  OnInit,
  OnDestroy,
  effect,
  ElementRef,
  ViewChild,
  untracked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, Router } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';
import Keycloak from 'keycloak-js';
import { CategoryService } from '../../../services/category.service';
import { CourseService } from '../../../services/course.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  host: { class: 'dark block' },
  template: `
    <div
      class="min-h-screen bg-[#030712] text-slate-100 font-sans antialiased selection:bg-indigo-500/30 relative"
    >
      <nav class="fixed top-0 w-full z-50 border-b border-white/5 backdrop-blur-xl bg-[#030712]/50">
        <div class="max-w-7xl mx-auto px-4 md:px-6 h-16 flex justify-between items-center">
          <div
            class="flex items-center gap-2 font-black text-xl tracking-tighter cursor-pointer"
            routerLink="/"
          >
            <div
              class="size-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm"
            >
              A
            </div>
            AMATUM<span class="text-indigo-600 ml-1 text-xs uppercase tracking-[0.2em]"
              >Lumina</span
            >
          </div>

          <div class="hidden md:flex items-center gap-8">
            <a
              routerLink="/"
              class="text-sm font-semibold text-slate-400 hover:text-white transition-colors"
              >Home</a
            >
            <button
              (click)="launch()"
              class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-full transition-all active:scale-95 cursor-pointer"
            >
              Sign In
            </button>
          </div>

          <div class="flex md:hidden items-center">
            <button
              (click)="isMenuOpen.set(!isMenuOpen())"
              class="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              @if (!isMenuOpen()) {
                <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6h16M4 12h16m-7 6h7" stroke-width="2" stroke-linecap="round" />
                </svg>
              } @else {
                <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round" />
                </svg>
              }
            </button>
          </div>
        </div>
      </nav>

      @if (isMenuOpen()) {
        <div
          class="fixed inset-0 z-50 bg-[#030712]/95 backdrop-blur-sm flex flex-col pt-24 px-6 animate-in fade-in duration-200"
        >
          <button
            (click)="isMenuOpen.set(false)"
            class="absolute top-6 right-6 p-3 text-slate-400 hover:text-white transition-colors cursor-pointer"
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
              class="flex items-center justify-between w-full px-4 py-3 bg-white/5 rounded-xl text-white text-sm font-semibold hover:bg-indigo-600 transition-colors cursor-pointer"
            >
              <span>Home</span>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
            <button
              (click)="launch(); isMenuOpen.set(false)"
              class="w-full px-6 py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-500 transition-all active:scale-95 cursor-pointer"
            >
              Sign In
            </button>
          </nav>
        </div>
      }

      <main class="pt-32 pb-20 px-6 max-w-7xl mx-auto animate-in fade-in duration-500">
        <header class="mb-12">
          <h1 class="text-4xl md:text-6xl font-black mb-4 tracking-tight">
            Discover <span class="text-indigo-500 italic">Expertise.</span>
          </h1>
          <p class="text-slate-400 text-lg max-w-2xl font-medium">
            Sovereign training from industry leaders. Built in private workspaces, shared with the
            world.
          </p>
        </header>

        @if (isPageLoading()) {
          <div class="py-32 flex flex-col items-center justify-center gap-4 animate-in fade-in">
            <div
              class="size-6 border-2 border-white/10 border-t-indigo-500 rounded-full animate-spin"
            ></div>
            <div
              class="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold space-y-1 text-center"
            >
              @if (isLoadingCategories() || isLoadingCourses()) {
                <div>Loading...</div>
              }
            </div>
          </div>
        } @else if (hasError()) {
          <div
            class="w-full py-20 flex items-center justify-center animate-in fade-in duration-300"
          >
            <div class="max-w-md mx-auto text-center space-y-4">
              <div
                class="size-12 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto text-rose-400"
              >
                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 class="text-md font-black tracking-widest uppercase text-slate-200">
                Catalog Offline
              </h2>
              <p class="text-slate-500 text-xs leading-relaxed">
                We're having trouble reaching our servers right now. Please try again shortly.
              </p>
              <button
                (click)="retryConnections()"
                class="px-6 py-2 bg-white text-black hover:bg-indigo-600 hover:text-white font-black text-[10px] tracking-widest uppercase rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                Retry
              </button>
            </div>
          </div>
        } @else {
          <div class="relative mb-12">
            <div
              #categoryContainer
              class="flex gap-3 overflow-x-auto pb-6 no-scrollbar scroll-smooth items-center -mx-6 px-6 md:mx-0 md:px-0"
            >
              <button
                (click)="selectCategory('', 'All')"
                [class]="
                  activeCategoryId() === ''
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/10'
                "
                class="px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap active:scale-95 cursor-pointer"
              >
                All
              </button>

              @for (cat of categories(); track cat.id) {
                <button
                  [id]="'cat-' + cat.id"
                  (click)="selectCategory(cat.id, cat.name)"
                  [class]="
                    activeCategoryId() === cat.id
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/10'
                  "
                  class="px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap active:scale-95 cursor-pointer"
                >
                  {{ cat.name }}
                </button>
              }

              <div id="categorySentinel" class="min-w-10 flex items-center justify-center">
                @if (isLoadingCategories()) {
                  <div
                    class="size-4 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"
                  ></div>
                }
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            @for (course of courses(); track course.id) {
              <div
                class="group bg-white/2 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-indigo-500/40 transition-all duration-500 flex flex-col backdrop-blur-md"
              >
                <div [class]="'h-40 relative ' + getAccent(course.categoryId)">
                  <div class="absolute inset-0 bg-linear-to-t from-[#030712] to-transparent"></div>
                  <div class="absolute top-6 left-8">
                    <div
                      class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/20 border border-white/5 backdrop-blur-md"
                    >
                      <svg class="size-3 text-amber-400 fill-amber-400" viewBox="0 0 24 24">
                        <path
                          d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                        />
                      </svg>
                      <span class="text-[11px] font-black text-white tracking-tighter">
                        {{ course.rating || '0.0' }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="p-8 pt-4 flex flex-col flex-1">
                  <div class="flex items-center gap-2 mb-4">
                    <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest"
                      >{{ course.moduleCount || 0 }} Modules</span
                    >
                    <span class="text-[8px] font-black text-slate-700 uppercase tracking-widest"
                      >•</span
                    >
                    <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest"
                      >{{ course.learningStepCount || 0 }} Lessons</span
                    >
                  </div>

                  <h3
                    class="text-md font-black text-white mb-3 italic tracking-tighter leading-tight group-hover:text-indigo-400 transition-colors uppercase"
                  >
                    {{ course.title }}
                  </h3>

                  <div class="flex flex-wrap gap-2 mb-8">
                    @for (tag of course.tags; track tag) {
                      <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest"
                        >#{{ tag }}</span
                      >
                    }
                  </div>

                  <div
                    class="mt-auto pt-6 flex items-center justify-end gap-3 border-t border-white/5"
                  >
                    <div class="mr-auto flex flex-col items-start">
                      @if (course.accessTier === 'PREMIUM') {
                        <span
                          class="text-[7px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-0.5"
                          >Premium Access</span
                        >
                        <span class="text-[13px] font-black text-white italic tracking-tighter">{{
                          course.price | currency
                        }}</span>
                      } @else {
                        <span
                          class="text-[7px] font-black text-slate-600 uppercase tracking-[0.2em] mb-0.5"
                          >Free Access</span
                        >
                        <span class="text-[13px] font-black text-slate-400 italic tracking-tighter"
                          >Free</span
                        >
                      }
                    </div>

                    <button
                      title="View Course"
                      (click)="exploreCourse(course?.id)"
                      class="size-11 bg-white/5 border border-white/10 text-slate-500 rounded-2xl flex items-center justify-center hover:bg-white/10 hover:text-white transition-all active:scale-90 cursor-pointer"
                    >
                      <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            } @empty {
              @if (!isLoadingCourses() && !isLoadingCategories()) {
                <div
                  class="col-span-full py-32 border border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center text-center"
                >
                  <span class="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]"
                    >No Courses Available</span
                  >
                </div>
              }
            }

            @if (isLoadingCourses() && courses().length > 0) {
              @for (i of [1, 2, 3]; track i) {
                <div
                  class="bg-white/2 border border-white/5 rounded-[2.5rem] h-105 overflow-hidden flex flex-col animate-pulse backdrop-blur-md"
                >
                  <div class="h-40 bg-white/5 relative"></div>
                  <div class="p-8 pt-4 space-y-6 flex-1 flex flex-col">
                    <div class="flex gap-2"><div class="h-2 w-12 bg-white/10 rounded"></div></div>
                    <div class="space-y-3">
                      <div class="h-5 w-full bg-white/10 rounded-lg"></div>
                      <div class="h-5 w-2/3 bg-white/10 rounded-lg"></div>
                    </div>
                    <div class="mt-auto pt-10 border-t border-white/5 flex justify-between">
                      <div class="h-10 w-24 bg-white/5 rounded-xl"></div>
                      <div class="flex gap-2">
                        <div class="size-11 bg-white/5 rounded-2xl"></div>
                      </div>
                    </div>
                  </div>
                </div>
              }
            }
          </div>

          <div #courseSentinel class="h-20 w-full pointer-events-none"></div>
        }
      </main>
    </div>
  `,
  styles: [
    `
      .no-scrollbar::-webkit-scrollbar {
        display: none;
      }

      .overflow-x-auto {
        scroll-padding-left: 24px; 
      }
    `,
  ],
})
export class Explore implements OnInit, OnDestroy {
  private categoryService = inject(CategoryService);
  private courseService = inject(CourseService);
  private readonly authService = inject(AuthService);
  private router = inject(Router);

  @ViewChild('courseSentinel') courseSentinel!: ElementRef;

  isMenuOpen = signal(false);
  hasError = signal(false);

  activeCategoryId = signal('');
  activeCategoryName = signal('All');
  categories = signal<any[]>([]);
  categoryPage = 0;
  isLastCategoryPage = false;
  isLoadingCategories = signal(false);

  courses = signal<any[]>([]);
  currentCoursePage = signal(0);
  hasNextCoursePage = signal(true);
  isLoadingCourses = signal(false);

  isPageLoading = computed(() => this.isLoadingCategories() || this.isLoadingCourses());

  private destroy$ = new Subject<void>();
  private categoryObserver?: IntersectionObserver;
  private courseObserver?: IntersectionObserver;

  @ViewChild('categoryContainer') categoryContainer!: ElementRef;

  constructor() {
    effect(() => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow =
          this.isPageLoading() || this.isMenuOpen() ? 'hidden' : 'auto';
      }
    });

    effect(() => {
      const loading = this.isPageLoading();
      const error = this.hasError();
      if (!loading && !error) {
        setTimeout(() => {
          this.initCourseInfiniteScroll();
          this.initCategoryHorizontalScroll();
        }, 0);
      }
    });
  }

  ngOnInit() {
    this.fetchInitialCategories();
    this.loadCourses(true);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.categoryObserver?.disconnect();
    this.courseObserver?.disconnect();
  }

  async launch() {
    this.authService.login();
  }

  retryConnections() {
    this.hasError.set(false);
    this.categories.set([]);
    this.courses.set([]);
    this.fetchInitialCategories();
    this.resetAndReloadCourses();
  }

  private fetchInitialCategories() {
    this.categoryPage = 0;
    this.loadMoreCategories();
  }

  private initCategoryHorizontalScroll() {
    this.categoryObserver?.disconnect();
    this.categoryObserver = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          !this.isLoadingCategories() &&
          !this.isLastCategoryPage &&
          !this.hasError()
        ) {
          this.categoryPage++;
          this.loadMoreCategories();
        }
      },
      { threshold: 0.1, rootMargin: '0px 100px 0px 0px' },
    );

    const sentinel = document.querySelector('#categorySentinel');
    if (sentinel) this.categoryObserver.observe(sentinel);
  }

  private loadMoreCategories() {
    if (this.isLoadingCategories() || this.isLastCategoryPage || this.hasError()) return;
    this.isLoadingCategories.set(true);
    this.categoryService
      .getAllActivePaginatedCategories(this.categoryPage, 8)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const apiData = res._embedded?.categoryResponseList || [];
          this.isLastCategoryPage = !res._links?.next;
          this.categories.update((current) => [...current, ...apiData]);
          this.isLoadingCategories.set(false);
        },
        error: () => {
          this.isLoadingCategories.set(false);
          this.hasError.set(true);
        },
      });
  }

  selectCategory(id: string, name: string) {
    if (this.activeCategoryId() !== id) {
      this.activeCategoryId.set(id);
      this.activeCategoryName.set(name);
      this.resetAndReloadCourses();

      // Scroll the selected element into view
      setTimeout(() => {
        const element = document.getElementById(`cat-${id}`);
        if (element && this.categoryContainer?.nativeElement) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center',
          });
        }
      }, 100);
    }
  }

  private resetAndReloadCourses() {
    if (this.hasError()) return;
    this.currentCoursePage.set(0);
    this.hasNextCoursePage.set(true);
    this.courses.set([]);
    this.loadCourses(true);
  }

  private initCourseInfiniteScroll() {
    this.courseObserver?.disconnect();
    this.courseObserver = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          !this.isLoadingCourses() &&
          this.hasNextCoursePage() &&
          this.courses().length > 0 &&
          !this.hasError()
        ) {
          untracked(() => {
            this.currentCoursePage.update((p) => p + 1);
            this.loadCourses(false);
          });
        }
      },
      { threshold: 0.1 },
    );

    if (this.courseSentinel) {
      this.courseObserver.observe(this.courseSentinel.nativeElement);
    }
  }

  private loadCourses(reset: boolean) {
    if (this.isLoadingCourses() || this.hasError()) return;
    this.isLoadingCourses.set(true);

    this.courseService
      .fetchCPublic('', this.activeCategoryId(), this.currentCoursePage())
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoadingCourses.set(false)),
      )
      .subscribe({
        next: (response) => {
          const list = response._embedded?.courseResponseList || [];
          if (reset) {
            this.courses.set(list);
          } else {
            this.courses.update((curr) => [...curr, ...list]);
          }
          this.hasNextCoursePage.set(response.page.number < response.page.totalPages - 1);
        },
        error: (err) => {
          console.error('Failed to load courses for catalog view', err);
          this.hasNextCoursePage.set(false);
          this.hasError.set(true);
          if (reset) this.courses.set([]);
        },
      });
  }

  getAccent(categoryId: string): string {
    const accents = ['bg-emerald-500/10', 'bg-indigo-500/10', 'bg-rose-500/10', 'bg-amber-500/10'];
    const index = categoryId ? categoryId.length % accents.length : 0;
    return accents[index];
  }

  exploreCourse(courseId: string) {
    if (!courseId) return;
    this.router.navigate(['/explore/', courseId]);
  }
}

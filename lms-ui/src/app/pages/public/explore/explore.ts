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
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';
import { CategoryService } from '../../../services/category.service';
import { CourseService } from '../../../services/course.service';
import { AuthService } from '../../../services/auth.service';
import { Loader } from '../../../components/loader/loader';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, FormsModule, Loader],
  host: { class: 'dark block' },
  template: `
    <div
      class="min-h-screen bg-[#030712] text-slate-100 antialiased selection:bg-indigo-500/30 relative"
    >
      <nav class="fixed top-0 w-full z-50 border-b border-white/5 backdrop-blur-xl bg-[#030712]/50">
        <div class="max-w-7xl mx-auto px-4 md:px-6 h-16 flex justify-between items-center">
          <div
            class="flex items-center gap-2 font-black text-lg tracking-tighter cursor-pointer"
            routerLink="/"
          >
            <div class="flex items-baseline gap-2">
              <div class="font-bold tracking-tight text-lg text-white leading-none">AMATUM</div>
              <span
                class="text-indigo-400 text-lg uppercase tracking-widest font-semibold leading-none"
                >Lumina</span
              >
            </div>
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
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            @for (i of [1, 2, 3, 4, 5, 6]; track i) {
              <app-loader type="skeleton-card" />
            }
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
          <section
            class="mb-12 rounded-2xl bg-linear-to-b from-[#0a0f1d] to-[#030712] border border-indigo-500/20 shadow-2xl overflow-hidden backdrop-blur-md"
          >
            <!-- Window Title Bar -->
            <div
              class="px-6 py-4 bg-white/2 border-b border-white/5 flex items-center justify-between"
            >
              <div class="flex items-center gap-2.5">
                <div class="flex gap-1.5">
                  <div class="size-3 rounded-full bg-rose-500/80"></div>
                  <div class="size-3 rounded-full bg-amber-500/80"></div>
                  <div class="size-3 rounded-full bg-indigo-500/80"></div>
                </div>
                <span class="text-xs font-bold text-slate-400 ml-2 font-mono"
                  >talemai://learning-assistant</span
                >
              </div>
            </div>

            <!-- Chat Stream Body -->
            <div class="p-6 md:p-8 space-y-6 max-h-80 overflow-y-auto custom-scrollbar">
              @for (msg of messages(); track $index) {
                <div class="flex items-start gap-4">
                  @if (msg.sender === 'ai') {
                    <div
                      class="size-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-xs shrink-0 shadow-lg shadow-indigo-900/20"
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
                      class="flex-1 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-4 text-white text-xs md:text-sm leading-relaxed ml-12 order-1"
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
                <span class="absolute left-4 text-indigo-500 font-mono text-sm font-bold">></span>
                <input
                  type="text"
                  [ngModel]="currentMessage()"
                  (ngModelChange)="currentMessage.set($event)"
                  (keydown.enter)="handleEnter($event)"
                  placeholder="Ask AI to query courses (e.g., 'Advanced TypeScript & Architecture')..."
                  class="w-full bg-[#030712] border border-white/10 rounded-2xl pl-9 pr-5 py-4 text-xs md:text-sm focus:border-indigo-500/50 outline-none transition-all text-white placeholder-slate-500 shadow-inner"
                />
              </div>
            </div>
          </section>

          <!-- Search Controls Row: Category and Name Search -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div>
              <div class="mb-6">
                <h2 class="text-xs uppercase font-black tracking-widest text-slate-300">
                  Search by Category
                </h2>
                <p class="text-[14px] text-slate-500 font-medium mt-1">
                  Filter courses by specific categories to find targeted training.
                </p>
              </div>
              <div
                class="relative w-full"
                appClickOutside
                (clickOutside)="isDropdownOpen.set(!isDropdownOpen())"
              >
                <button
                  (click)="isDropdownOpen.set(!isDropdownOpen())"
                  class="w-full h-15.5 flex items-center justify-between px-6 bg-white/5 border border-white/10 rounded-2xl text-slate-200 hover:border-indigo-500/50 transition-all focus:ring-2 focus:ring-indigo-500/20 active:scale-[0.98] cursor-pointer"
                >
                  <div class="flex flex-col items-start overflow-hidden">
                    <span class="text-[10px] uppercase tracking-widest text-slate-500 font-black"
                      >Category</span
                    >
                    <span class="text-sm font-bold truncate w-full text-left">{{
                      activeCategoryName()
                    }}</span>
                  </div>
                  <svg
                    class="size-4 text-slate-500 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                @if (isDropdownOpen()) {
                  <div
                    class="absolute top-full mt-3 w-full bg-[#111827] border border-white/10 rounded-3xl p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
                  >
                    <input
                      type="text"
                      placeholder="Filter categories..."
                      (input)="searchTerm.set($any($event.target).value)"
                      class="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-2xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                    />

                    <div class="max-h-64 overflow-y-auto mt-2 space-y-1 custom-scrollbar">
                      @for (cat of filteredCategories(); track cat.id) {
                        <button
                          (click)="selectCategory(cat.id, cat.name)"
                          class="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors truncate cursor-pointer"
                        >
                          {{ cat.name }}
                        </button>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>

            <div>
              <div class="mb-6">
                <h2 class="text-xs uppercase font-black tracking-widest text-slate-300">
                  Search by Name
                </h2>
                <p class="text-[14px] text-slate-500 font-medium mt-1">
                  Type a course title or keyword to quickly find specific training.
                </p>
              </div>
              <div class="relative w-full h-15.5 flex items-center">
                <div class="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <svg
                    class="size-4 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  [ngModel]="searchQuery()"
                  (ngModelChange)="onSearchQueryChange($event)"
                  placeholder="Search courses by name..."
                  class="w-full h-full pl-14 pr-6 bg-white/5 border border-white/10 rounded-2xl text-slate-200 text-sm hover:border-indigo-500/50 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder-slate-600"
                />
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
                <app-loader type="skeleton-card" />
              }
            }
          </div>
        }

        <div #courseSentinel class="h-20 w-full pointer-events-none"></div>
      </main>
    </div>
  `,
  styles: [
    `
      .no-scrollbar::-webkit-scrollbar {
        display: none;
      }

      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.02);
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
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
  isLoadingCategories = signal(false);

  courses = signal<any[]>([]);
  currentCoursePage = signal(0);
  hasNextCoursePage = signal(true);
  isLoadingCourses = signal(false);

  isPageLoading = computed(() => this.isLoadingCategories() || this.isLoadingCourses());

  isDropdownOpen = signal(false);
  searchTerm = signal('');
  searchQuery = signal('');
  private searchDebounceTimer: any;

  // AI Chat State
  currentMessage = signal('');
  messages = signal<ChatMessage[]>([
    {
      sender: 'ai',
      text: 'Hello! I am your learning assistant. Type any training requirement below and press Enter to instantly search.',
    },
  ]);

  private destroy$ = new Subject<void>();
  private categoryObserver?: IntersectionObserver;
  private courseObserver?: IntersectionObserver;

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
        }, 0);
      }
    });
  }

  ngOnInit() {
    this.fetchCategories();
    this.loadCourses(true);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.categoryObserver?.disconnect();
    this.courseObserver?.disconnect();
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
  }

  async launch() {
    this.authService.login();
  }

  retryConnections() {
    this.hasError.set(false);
    this.categories.set([]);
    this.courses.set([]);
    this.fetchCategories();
    this.resetAndReloadCourses();
  }

  private fetchCategories() {
    this.isLoadingCategories.set(true);
    this.categoryService
      .getAllActiveCategories()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoadingCategories.set(false)),
      )
      .subscribe({
        next: (data) => {
          this.categories.set(data);
        },
        error: () => {
          this.isLoadingCategories.set(false);
          this.hasError.set(true);
        },
      });
  }

  combinedCategories = computed(() => {
    const allOption = { id: '', name: 'All' };
    return [allOption, ...this.categories()];
  });

  filteredCategories = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.combinedCategories().filter((c) => c.name.toLowerCase().includes(term));
  });

  selectCategory(id: string, name: string) {
    this.activeCategoryId.set(id);
    this.activeCategoryName.set(name);
    this.isDropdownOpen.set(false);
    this.searchTerm.set('');
    this.resetAndReloadCourses();
  }

  onSearchQueryChange(query: string) {
    this.searchQuery.set(query);
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    this.searchDebounceTimer = setTimeout(() => {
      this.resetAndReloadCourses();
    }, 300);
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
          text: `Processed query: "${text}". Filtering training modules across our sovereign catalog.`,
        },
      ]);
    }, 1000);
  }

  private resetAndReloadCourses() {
    if (this.hasError()) return;
    this.currentCoursePage.set(0);
    this.hasNextCoursePage.set(true);
    this.courses.set([]);

    // Reconnect observer if needed
    setTimeout(() => {
      if (this.courseObserver && this.courseSentinel) {
        this.courseObserver.disconnect();
        this.courseObserver.observe(this.courseSentinel.nativeElement);
      }
    }, 50);

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
      .fetchCPublic(this.searchQuery(), this.activeCategoryId(), this.currentCoursePage())
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

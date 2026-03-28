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
import { CourseService, CourseResponse } from '../../../services/course.service';
import { CategoryService } from '../../../services/category.service';

@Component({
  selector: 'app-manager-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20 px-6">
      <header
        class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10"
      >
        <div>
          <h1 class="text-md font-black text-white italic tracking-tighter mb-2 uppercase">
            Courses
          </h1>
          <p class="text-slate-500 text-sm font-medium">
            Manage and deploy your organization's curriculum.
          </p>
        </div>

        <div class="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div
            class="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1.5 backdrop-blur-3xl w-full md:w-auto"
          >
            <div class="relative flex-1 md:w-64 group">
              <svg
                class="absolute left-4 top-1/2 -translate-y-1/2 size-3.5 text-slate-600 group-focus-within:text-indigo-400 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-width="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                [ngModel]="searchQuery()"
                (ngModelChange)="searchQuery.set($event)"
                type="text"
                placeholder="Search courses..."
                class="w-full bg-transparent border-none outline-0 py-2 pl-10 pr-4 text-[11px] font-bold text-white placeholder:text-slate-600 focus:ring-0 uppercase tracking-widest"
              />
            </div>

            <div class="h-4 w-px bg-white/10 mx-1"></div>

            <div class="relative">
              <button
                (click)="toggleDropdown($event)"
                class="flex items-center gap-3 px-4 py-2 hover:bg-white/5 rounded-xl transition-all group"
              >
                <span
                  class="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white"
                  >{{ activeCategoryName() }}</span
                >
                <svg
                  class="size-3 text-slate-600 group-hover:text-white transition-transform"
                  [class.rotate-180]="isDropdownOpen()"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path stroke-width="3" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              @if (isDropdownOpen()) {
                <div
                  class="absolute top-[calc(100%+8px)] right-0 w-48 bg-[#0b1120] border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl p-1 backdrop-blur-3xl"
                >
                  <button
                    (click)="selectCategory({ id: '', name: 'All Categories' })"
                    class="w-full text-left px-4 py-2.5 rounded-lg hover:bg-white/5 transition-all group border-b border-white/5"
                  >
                    <span class="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white"
                      >All Categories</span
                    >
                  </button>

                  @for (cat of categoriesData(); track cat.id) {
                    <button
                      (click)="selectCategory(cat)"
                      class="w-full text-left px-4 py-2.5 rounded-lg hover:bg-indigo-600 transition-all"
                    >
                      <span class="text-[9px] font-black uppercase tracking-widest text-white">{{
                        cat.name
                      }}</span>
                    </button>
                  }
                </div>
              }
            </div>
          </div>

          <a
            routerLink="/manager/courses/studio"
            class="h-10 px-6 bg-white text-black rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white transition-all active:scale-95 font-black uppercase text-[10px] tracking-widest shadow-lg shrink-0 cursor-pointer w-full md:w-auto"
          >
            <span>Create Course</span>
            <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-width="3" d="M12 4v16m8-8H4" />
            </svg>
          </a>
        </div>
      </header>

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
            (click)="viewMode.set('archived')"
            [class]="
              viewMode() === 'archived' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'
            "
            class="px-6 py-2 rounded-lg text-[12px] font-black uppercase tracking-widest transition-all cursor-pointer"
          >
            Archived
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
        @for (course of courses(); track course.id) {
          <div
            [class.grayscale]="viewMode() === 'archived'"
            [class.opacity-70]="viewMode() === 'archived'"
            class="group bg-white/2 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-indigo-500/40 transition-all duration-500 flex flex-col backdrop-blur-md"
          >
            <div [class]="'h-40 relative ' + getAccent(course.categoryId)">
              <div class="absolute inset-0 bg-linear-to-t from-[#030712] to-transparent"></div>

              <div class="absolute top-6 right-8">
                <span
                  class="px-3 py-1 rounded-lg bg-black/40 border border-white/10 text-[8px] font-black uppercase tracking-widest text-white flex items-center gap-2"
                >
                  <div
                    class="size-1 rounded-full"
                    [class]="statusConfig[course.status].color"
                  ></div>
                  {{ statusConfig[course.status].label }}
                </span>
              </div>
            </div>

            <div class="p-8 pt-4 flex flex-col flex-1">
              <div class="flex items-center gap-2 mb-4">
                <span class="text-[8px] font-black text-indigo-400 uppercase tracking-widest"
                  >4 Modules</span
                >
                <span class="text-[8px] font-black text-slate-700 uppercase tracking-widest"
                  >•</span
                >
                <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest"
                  >12 Lessons</span
                >
              </div>

              <h3
                class="text-md font-black text-white mb-3 italic tracking-tighter leading-tight group-hover:text-indigo-400 transition-colors uppercase"
              >
                {{ course.title }}
              </h3>

              <div class="flex flex-wrap gap-2 mb-6">
                @for (tag of course.tags; track tag) {
                  <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest"
                    >#{{ tag }}</span
                  >
                }
              </div>

              <div class="mt-auto pt-6 flex items-center justify-between border-t border-white/5">
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-2">
                    <span class="text-[8px] font-black text-slate-600 uppercase tracking-widest"
                      >Tier:</span
                    >
                    <span class="text-[10px] text-white font-bold italic">{{
                      course.accessTier
                    }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-[8px] font-black text-slate-600 uppercase tracking-widest"
                      >Visibility:</span
                    >
                    <span class="text-[10px] text-white font-bold italic">{{
                      course.isFeatured ? 'Public' : 'Private'
                    }}</span>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  @if (viewMode() === 'active') {
                    <button
                      (click)="confirmDelete(course)"
                      class="size-10 flex items-center justify-center rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-90 cursor-pointer"
                    >
                      <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  } @else {
                    <button
                      (click)="restoreCourse(course.id)"
                      class="size-10 flex items-center justify-center rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all active:scale-90 cursor-pointer"
                    >
                      <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  }
                  
                  <a
                    [routerLink]="['/manager/courses/studio', course.id]"
                    class="size-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black transition-all active:scale-95 cursor-pointer"
                  >
                    <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </a>
                </div>
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

        @if (isLoading()) {
          @for (i of [1, 2, 3]; track i) {
            <div
              class="bg-white/2 border border-white/5 rounded-[2.5rem] h-105 overflow-hidden flex flex-col animate-pulse backdrop-blur-md"
            >
              <div class="h-40 bg-white/5 relative">
                <div class="absolute top-6 right-8 w-16 h-5 bg-white/5 rounded-lg"></div>
              </div>
              <div class="p-8 pt-4 space-y-6 flex-1 flex flex-col">
                <div class="flex gap-2">
                  <div class="h-2 w-12 bg-white/10 rounded"></div>
                  <div class="h-2 w-12 bg-white/10 rounded"></div>
                </div>
                <div class="space-y-3">
                  <div class="h-5 w-full bg-white/10 rounded-lg"></div>
                  <div class="h-5 w-2/3 bg-white/10 rounded-lg"></div>
                </div>
                <div
                  class="mt-auto pt-10 flex items-center justify-between border-t border-white/5"
                >
                  <div class="space-y-2">
                    <div class="h-2 w-20 bg-white/5 rounded"></div>
                    <div class="h-2 w-16 bg-white/5 rounded"></div>
                  </div>
                  <div class="flex gap-2">
                    <div class="size-10 bg-white/5 rounded-xl"></div>
                    <div class="size-10 bg-white/5 rounded-xl"></div>
                  </div>
                </div>
              </div>
            </div>
          }
        }
      </div>

      <div #scrollSentinel class="h-20 w-full"></div>

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

      <dialog #confirmModal class="fixed inset-0 m-auto bg-[#0b1120] border border-white/10 rounded-3xl p-8 backdrop:bg-black/80 backdrop:backdrop-blur-sm shadow-2xl max-w-sm w-full animate-in zoom-in duration-300">
        <div class="space-y-6 text-center">
          <div class="size-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto">
            <svg class="size-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div class="space-y-2">
            <h3 class="text-white font-black uppercase tracking-widest text-sm italic">Archive Course</h3>
            <p class="text-slate-500 text-[11px] leading-relaxed">Are you sure you want to move <span class="text-indigo-400 font-bold italic">"{{ courseToArchive()?.title }}"</span> to the archive?</p>
          </div>
          <div class="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
            <button (click)="confirmModal.close()" class="px-6 py-3 rounded-xl bg-white/5 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all cursor-pointer">Cancel</button>
            <button (click)="executeDelete()" class="px-6 py-3 rounded-xl bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 shadow-lg shadow-rose-900/20 transition-all cursor-pointer">Archive</button>
          </div>
        </div>
      </dialog>
    </div>
  `,
})
export class ManagerCourses implements OnInit, AfterViewInit {
  private courseService = inject(CourseService);
  private categoryService = inject(CategoryService);
  private scroller = inject(ViewportScroller);

  @ViewChild('scrollSentinel') scrollSentinel!: ElementRef;
  @ViewChild('confirmModal') confirmModal!: ElementRef<HTMLDialogElement>;

  readonly statusConfig: Record<'DRAFT' | 'PUBLISHED', { label: string; color: string }> = {
    PUBLISHED: { label: 'Live', color: 'bg-emerald-500' },
    DRAFT: { label: 'Draft', color: 'bg-amber-500' },
  };

  // SIGNALS
  viewMode = signal<'active' | 'archived'>('active');
  searchQuery = signal('');
  activeCategoryId = signal('');
  activeCategoryName = signal('All Categories');
  courseToArchive = signal<CourseResponse | null>(null);

  currentPage = signal(0);
  hasNextPage = signal(true);
  isLoading = signal(false);
  courses = signal<CourseResponse[]>([]);

  categoriesData = signal<any[]>([]);
  isDropdownOpen = signal(false);
  showBackToTop = signal(false);

  constructor() {
    effect(() => {
      this.viewMode();
      this.searchQuery();
      this.activeCategoryId();

      untracked(() => {
        this.resetAndReload();
      });
    });
  }

  ngOnInit(): void {
    this.categoryService
      .getAllActiveCategories()
      .subscribe((cats) => this.categoriesData.set(cats));
  }

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
    const scrollOffset = window.pageYOffset || document.documentElement.scrollTop;
    this.showBackToTop.set(scrollOffset > 500);
  }

  private resetAndReload() {
    this.currentPage.set(0);
    this.hasNextPage.set(true);
    this.courses.set([]);
    this.loadData(true);
  }

  private loadData(reset: boolean) {
    if (this.isLoading()) return;
    this.isLoading.set(true);

    this.courseService
      .fetchCourses(
        this.viewMode(),
        this.searchQuery(),
        this.activeCategoryId(),
        this.currentPage(),
      )
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          const list = response._embedded?.courseResponseList || [];
          if (reset) this.courses.set(list);
          else this.courses.update((curr) => [...curr, ...list]);
          this.hasNextPage.set(response.page.number < response.page.totalPages - 1);
        },
        error: () => {
          this.hasNextPage.set(false);
          if (reset) this.courses.set([]);
        },
      });
  }

  selectCategory(cat: { id: string; name: string }) {
    this.activeCategoryId.set(cat.id);
    this.activeCategoryName.set(cat.name);
    this.isDropdownOpen.set(false);
  }

  getAccent(categoryId: string): string {
    const accents = ['bg-emerald-500/10', 'bg-indigo-500/10', 'bg-rose-500/10', 'bg-amber-500/10'];
    const index = categoryId ? categoryId.length % accents.length : 0;
    return accents[index];
  }

  scrollToTop() {
    this.scroller.scrollToPosition([0, 0]);
  }
  toggleDropdown(e: Event) {
    e.stopPropagation();
    this.isDropdownOpen.update((v) => !v);
  }
  @HostListener('document:click') close() {
    this.isDropdownOpen.set(false);
  }

  confirmDelete(course: CourseResponse) {
    this.courseToArchive.set(course);
    this.confirmModal.nativeElement.showModal();
  }

  executeDelete() {
    const course = this.courseToArchive();
    if (course) {
      this.courseService.deleteCourse(course.id).subscribe(() => {
        this.courses.update((list) => list.filter((c) => c.id !== course.id));
        this.confirmModal.nativeElement.close();
        this.courseToArchive.set(null);
      });
    }
  }

  restoreCourse(id: string) {
    this.courseService.restoreCourse(id).subscribe(() => {
      this.courses.update((list) => list.filter((c) => c.id !== id));
    });
  }
}
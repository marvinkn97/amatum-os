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
import { TenantService } from '../../../services/tenant.service';

@Component({
  selector: 'app-course-marketplace',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20 px-6">
      <header
        class="relative z-50 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10"
      >
        <div class="space-y-1">
          <h1 class="text-md font-black text-white italic tracking-tighter uppercase">
            Curriculum
          </h1>
          <p class="text-slate-500 text-sm font-medium">
            Explore professional pathways and certify your skills.
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
                  class="absolute top-[calc(100%+12px)] right-0 w-56 bg-[#0b1120] border border-white/10 rounded-2xl overflow-hidden z-100 shadow-2xl p-1.5 backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-200"
                >
                  <button
                    (click)="selectCategory({ id: '', name: 'All Categories' })"
                    class="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 transition-all group border-b border-white/5 mb-1"
                  >
                    <span
                      class="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white"
                      >All Categories</span
                    >
                  </button>
                  <div class="max-h-64 overflow-y-auto custom-scrollbar">
                    @for (cat of categoriesData(); track cat.id) {
                      <button
                        (click)="selectCategory(cat)"
                        class="w-full text-left px-4 py-3 rounded-xl hover:bg-indigo-600 transition-all group mb-0.5"
                      >
                        <span class="text-[9px] font-black uppercase tracking-widest text-white">{{
                          cat.name
                        }}</span>
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
        @for (course of courses(); track course.id) {
          <div
            class="group bg-white/2 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-indigo-500/40 transition-all duration-500 flex flex-col backdrop-blur-md"
          >
            <div [class]="'h-40 relative ' + getAccent(course.categoryId)">
              <div class="absolute inset-0 bg-linear-to-t from-[#030712] to-transparent"></div>
            </div>

            <div class="p-8 pt-4 flex flex-col flex-1">
              <div class="flex items-center gap-2 mb-4">
                <span class="text-[8px] font-black text-indigo-400 uppercase tracking-widest"
                  >{{ course.moduleCount }} Modules</span
                >
                <span class="text-[8px] font-black text-slate-700 uppercase tracking-widest"
                  >•</span
                >
                <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest"
                  >{{ course.learningStepCount }} Lessons</span
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

              <div class="mt-auto pt-6 flex items-center justify-end gap-3 border-t border-white/5">
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

                <a
                  [routerLink]="['/learner/course-catalogue', course.id]"
                  class="size-11 bg-white/5 border border-white/10 text-slate-500 rounded-2xl flex items-center justify-center hover:bg-white/10 hover:text-white transition-all active:scale-90"
                  title="View Curriculum"
                >
                  <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </a>

                <button
                  title="Enroll"
                  (click)="enroll(course)"
                  class="size-11 bg-white/5 border border-white/10 text-slate-500 hover:bg-indigo-600 hover:border-indigo-500 hover:text-white rounded-2xl flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                >
                  <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        } @empty {
          @if (!isLoading()) {
            <div
              class="col-span-full py-32 border border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center text-center"
            >
              <span class="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]"
                >No Courses Available</span
              >
            </div>
          }
        }

        @if (isLoading()) {
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
                    <div class="size-11 bg-white/5 rounded-2xl"></div>
                  </div>
                </div>
              </div>
            </div>
          }
        }
      </div>

      <div #scrollSentinel class="h-20 w-full pointer-events-none"></div>

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
export class CourseCatalogueComponent implements OnInit, AfterViewInit {
  private courseService = inject(CourseService);
  private categoryService = inject(CategoryService);
  private scroller = inject(ViewportScroller);
  private tenantService = inject(TenantService);

  @ViewChild('scrollSentinel') scrollSentinel!: ElementRef;

  searchQuery = signal('');
  activeCategoryId = signal('');
  activeCategoryName = signal('All Categories');

  courses = signal<CourseResponse[]>([]);
  currentPage = signal(0);
  hasNextPage = signal(true);
  isLoading = signal(false);

  categoriesData = signal<any[]>([]);
  isDropdownOpen = signal(false);
  showBackToTop = signal(false);

  constructor() {
    effect(() => {
      this.searchQuery();
      this.activeCategoryId();
      this.tenantService.tenantId(); // Tracks tenant ID changes
      untracked(() => this.resetAndReload());
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
      .fetchCatalog(this.searchQuery(), this.activeCategoryId(), this.currentPage())
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

  getAccent(categoryId: string): string {
    const accents = ['bg-emerald-500/10', 'bg-indigo-500/10', 'bg-rose-500/10', 'bg-amber-500/10'];
    const index = categoryId ? categoryId.length % accents.length : 0;
    return accents[index];
  }

  selectCategory(cat: { id: string; name: string }) {
    this.activeCategoryId.set(cat.id);
    this.activeCategoryName.set(cat.name);
    this.isDropdownOpen.set(false);
  }

  toggleDropdown(e: Event) {
    e.stopPropagation();
    this.isDropdownOpen.update((v) => !v);
  }

  @HostListener('document:click') close() {
    this.isDropdownOpen.set(false);
  }

  scrollToTop() {
    this.scroller.scrollToPosition([0, 0]);
  }

  enroll(course: CourseResponse) {
    console.log('Enrolling in:', course.title);
  }
}

import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, map } from 'rxjs';
import { CategoryService } from '../../../services/category.service';

interface Category {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  accentClass: string;
}

@Component({
  selector: 'app-course-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20 px-6">
      @if (toast(); as t) {
        <div class="fixed top-10 right-10 z-200 animate-in slide-in-from-right-8 duration-300">
          <div
            [class]="
              'flex items-center gap-4 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl ' +
              (t.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400')
            "
          >
            <div
              [class]="
                'size-2 rounded-full animate-pulse ' +
                (t.type === 'success' ? 'bg-emerald-400' : 'bg-red-400')
              "
            ></div>
            <p class="text-[10px] font-black uppercase tracking-[0.2em] italic">{{ t.message }}</p>
          </div>
        </div>
      }

      <header
        class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10 pt-10"
      >
        <div class="flex flex-col gap-2">
          <h1 class="text-md font-black text-white italic tracking-tighter uppercase">
            Course Categories
          </h1>
          <p class="text-slate-500 text-sm font-medium">
            Define and manage classification for the course catalog.
          </p>
        </div>

        <div class="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div
            class="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1.5 backdrop-blur-3xl w-full md:w-64 group"
          >
            <div class="relative w-full">
              <svg
                class="absolute left-4 top-1/2 -translate-y-1/2 size-3.5 text-slate-600 group-focus-within:text-indigo-400 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-width="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                [ngModel]="searchQuery"
                (ngModelChange)="onSearchChange($event)"
                type="text"
                placeholder="Filter category..."
                class="w-full bg-transparent border-none outline-0 py-2 pl-10 pr-4 text-[11px] font-bold text-white placeholder:text-slate-600 focus:ring-0 tracking-widest"
              />
            </div>
          </div>

          <button
            (click)="openModal()"
            class="flex items-center justify-center gap-3 px-8 py-3.5 bg-white text-black hover:bg-indigo-600 hover:text-white rounded-2xl transition-all shadow-lg active:scale-95 cursor-pointer w-full md:w-auto"
          >
            <span class="text-[10px] font-black uppercase tracking-widest">Add Category</span>
            <svg class="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-width="3" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        @if (isLoading() && categories().length === 0) {
          @for (i of [1, 2, 3]; track i) {
            <div
              class="bg-white/2 border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col h-70 animate-shimmer"
            >
              <div class="h-24 bg-white/5 relative mb-6">
                <div class="absolute top-6 left-8 size-9 bg-white/10 rounded-xl"></div>
                <div class="absolute top-6 right-8 w-16 h-4 bg-white/10 rounded-full"></div>
              </div>
              <div class="px-8 space-y-4">
                <div class="h-6 bg-white/10 rounded-lg w-3/4"></div>
                <div class="space-y-2">
                  <div class="h-3 bg-white/5 rounded-md w-full"></div>
                  <div class="h-3 bg-white/5 rounded-md w-5/6"></div>
                </div>
              </div>
            </div>
          }
        }

        @for (cat of categories(); track cat.id) {
          <div
            class="group bg-white/2 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-indigo-500/40 transition-all duration-500 flex flex-col backdrop-blur-md relative pb-10"
          >
            <div [class]="'h-24 relative ' + cat.accentClass">
              <div
                class="absolute inset-0 bg-linear-to-t from-[#030712] to-transparent opacity-60"
              ></div>
              <button
                (click)="openModal(cat)"
                class="absolute top-6 left-8 size-9 bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-xl flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer"
              >
                <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-width="2.5"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <div class="absolute top-6 right-8 flex items-center gap-3">
                <span
                  class="text-[8px] font-black uppercase tracking-[0.2em]"
                  [class]="cat.isActive ? 'text-indigo-400' : 'text-slate-500'"
                >
                  {{ cat.isActive ? 'Active' : 'Hidden' }}
                </span>
                <button
                  (click)="toggleActive(cat)"
                  class="relative w-9 h-5 rounded-full transition-colors cursor-pointer p-1"
                  [class]="cat.isActive ? 'bg-indigo-600' : 'bg-white/10'"
                >
                  <div
                    class="size-3 bg-white rounded-full transition-transform"
                    [class.translate-x-4]="cat.isActive"
                  ></div>
                </button>
              </div>
            </div>
            <div class="px-8 pt-4 flex flex-col flex-1">
              <h3
                class="text-md font-black text-white mb-3 italic tracking-tighter leading-tight group-hover:text-indigo-400 transition-colors"
              >
                {{ cat.title }}
              </h3>
              <p class="text-sm text-slate-500 font-medium leading-relaxed italic">
                {{ cat.description }}
              </p>
            </div>
          </div>
        } @empty {
          @if (!isLoading()) {
            <div class="col-span-full py-20 text-center">
              <p class="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] italic">
                No categories found
              </p>
            </div>
          }
        }
      </div>

      <div id="loadMoreSentinel" class="h-20 flex items-center justify-center">
        @if (isLoading() && categories().length > 0) {
          <div
            class="size-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"
          ></div>
        }
      </div>

      @if (isModalOpen()) {
        <div class="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div
            (click)="closeModal()"
            class="absolute inset-0 bg-black/95 backdrop-blur-md animate-in fade-in duration-500"
          ></div>

          <form
            #catForm="ngForm"
            (ngSubmit)="saveCategory()"
            class="relative w-full max-w-lg bg-[#030712] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in slide-in-from-bottom-8 duration-300"
          >
            <h3 class="text-md font-black text-white tracking-tighter uppercase italic mb-8">
              {{ editingId() ? 'Modify' : 'New' }} Category
            </h3>

            <div class="space-y-6">
              <div>
                <label
                  class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1"
                  >Title</label
                >
                <input
                  name="title"
                  [(ngModel)]="formModel.title"
                  #title="ngModel"
                  required
                  minlength="2"
                  type="text"
                  [class.border-red-500/50]="title.invalid && title.touched"
                  class="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all tracking-tight"
                  placeholder="e.g. Software Engineering"
                />
                @if (title.invalid && title.touched) {
                  <span
                    class="text-[11px] text-red-500/80 font-black uppercase tracking-tighter mt-2 ml-1"
                    >Title requires min 2 characters</span
                  >
                }
              </div>

              <div>
                <label
                  class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1"
                  >Description</label
                >
                <textarea
                  name="description"
                  [(ngModel)]="formModel.description"
                  #desc="ngModel"
                  required
                  minlength="25"
                  rows="4"
                  [class.border-red-500/50]="desc.invalid && desc.touched"
                  class="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-medium text-white focus:outline-none focus:border-indigo-500/50 transition-all resize-none italic"
                  placeholder="Category context..."
                ></textarea>
                 @if (desc.invalid && desc.touched) {
                  <span
                    class="text-[11px] text-red-500/80 font-black uppercase tracking-tighter mt-2 ml-1"
                    >Description requires min 25 characters</span
                  >
                }
              </div>

              <div class="pt-6 flex flex-col gap-3">
                <button
                  type="submit"
                  class="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ editingId() ? 'Update Entry' : 'Create Category' }}
                </button>
                <button
                  type="button"
                  (click)="closeModal()"
                  class="w-full py-2 text-slate-600 text-[10px] font-black uppercase hover:text-slate-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
      }
      .animate-shimmer {
        background: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0.03) 25%,
          rgba(255, 255, 255, 0.08) 50%,
          rgba(255, 255, 255, 0.03) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 2s infinite linear;
      }
      @keyframes shimmer {
        from {
          background-position: 200% 0;
        }
        to {
          background-position: -200% 0;
        }
      }
    `,
  ],
})
export class CourseCategoriesComponent implements OnInit, OnDestroy {
  private categoryService = inject(CategoryService);

  searchQuery = '';
  currentPage = 0;
  pageSize = 9;
  isLastPage = false;
  isLoading = signal(false);

  isModalOpen = signal(false);
  editingId = signal<string | null>(null);
  categories = signal<Category[]>([]);
  formModel = { title: '', description: '' };

  // Toast State
  toast = signal<{ message: string; type: 'success' | 'error' } | null>(null);

  private accents = ['bg-emerald-500/10', 'bg-red-500/10', 'bg-indigo-500/10'];
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  private observer?: IntersectionObserver;

  ngOnInit() {
    this.setupSearch();
    this.resetAndLoad();
    this.setupInfiniteScroll();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.observer?.disconnect();
  }

  private showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toast.set({ message, type });
    setTimeout(() => this.toast.set(null), 3000);
  }

  private setupSearch() {
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((query) => {
        this.searchQuery = query;
        this.resetAndLoad();
      });
  }

  private setupInfiniteScroll() {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !this.isLoading() && !this.isLastPage) {
          this.loadNextPage();
        }
      },
      { threshold: 0.1 },
    );
    setTimeout(() => {
      const sentinel = document.querySelector('#loadMoreSentinel');
      if (sentinel) this.observer?.observe(sentinel);
    }, 500);
  }

  private resetAndLoad() {
    this.currentPage = 0;
    this.isLastPage = false;
    this.categories.set([]);
    this.fetchData();
  }

  private loadNextPage() {
    this.currentPage++;
    this.fetchData();
  }

  private fetchData() {
    if (this.isLastPage || this.isLoading()) return;
    this.isLoading.set(true);
    const request = this.searchQuery.trim()
      ? this.categoryService.searchCategories(this.searchQuery, this.currentPage, this.pageSize)
      : this.categoryService.getAllCategories(this.currentPage, this.pageSize);

    request
      .pipe(
        takeUntil(this.destroy$),
        map((response) => response._embedded?.categoryResponseList || []),
      )
      .subscribe({
        next: (mappedData) => {
          this.isLastPage = mappedData.length < this.pageSize;
          const cards = mappedData.map((item: any, index: number) => ({
            id: item.id,
            title: item.name,
            description: item.description,
            isActive: item.isActive,
            accentClass: this.accents[(this.categories().length + index) % this.accents.length],
          }));
          this.categories.update((current) => [...current, ...cards]);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.showToast('Failed to load categories', 'error');
        },
      });
  }

  onSearchChange(query: string) {
    this.searchSubject.next(query);
  }

  openModal(category?: Category) {
    if (category) {
      this.editingId.set(category.id);
      this.formModel = { title: category.title, description: category.description };
    } else {
      this.editingId.set(null);
      this.formModel = { title: '', description: '' };
    }
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingId.set(null);
    this.formModel = { title: '', description: '' };
  }

  toggleActive(cat: Category) {
    this.categoryService.toggleStatus(cat.id).subscribe({
      next: () => {
        this.categories.update((list) =>
          list.map((c) => (c.id === cat.id ? { ...c, isActive: !c.isActive } : c)),
        );
        this.showToast(`Category ${!cat.isActive ? 'activated' : 'hidden'}`);
      },
      error: () => this.showToast('Failed to update status', 'error'),
    });
  }

  saveCategory() {
    // Manual check for additional safety
    if (!this.formModel.title || this.formModel.title.length < 2 || !this.formModel.description || this.formModel.description.length < 25 ) {
      this.showToast('Please fill all required fields correctly', 'error');
      return;
    }

    const request = { name: this.formModel.title, description: this.formModel.description };
    const operation = this.editingId()
      ? this.categoryService.updateCategory(this.editingId()!, request)
      : this.categoryService.createCategory(request);

    operation.subscribe({
      next: () => {
        this.showToast(
          this.editingId() ? 'Entry updated successfully' : 'Category created successfully',
        );
        this.resetAndLoad();
        this.closeModal();
      },
      error: () => this.showToast('An error occurred during save', 'error'),
    });
  }
}

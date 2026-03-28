import { Component, signal, computed, inject, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import Keycloak from 'keycloak-js';
import { CategoryService } from '../../../services/category.service';

interface Course {
  id: string;
  title: string;
  partner: string;
  category: string;
  accentClass: string;
  modules: number;
  lessons: number;
}

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  host: { class: 'dark block' },
  template: `
    <div class="min-h-screen bg-[#030712] text-slate-100 font-sans antialiased selection:bg-indigo-500/30">
      
      <nav class="fixed top-0 w-full z-40 border-b border-white/5 backdrop-blur-xl bg-[#030712]/50">
        <div class="max-w-7xl mx-auto px-4 md:px-6 h-16 flex justify-between items-center">
          <div class="flex items-center gap-2 font-black text-xl tracking-tighter cursor-pointer" routerLink="/">
            <div class="size-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm">A</div>
            AMATUM<span class="text-indigo-600 ml-1 text-xs uppercase tracking-[0.2em]">Lumina</span>
          </div>

          <div class="hidden md:flex items-center gap-8">
            <a routerLink="/" class="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Home</a>
            <button (click)="launch()" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-full transition-all active:scale-95 cursor-pointer">
              Sign In
            </button>
          </div>

          <div class="flex md:hidden items-center">
            <button (click)="isMenuOpen.set(!isMenuOpen())" class="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer">
              @if (!isMenuOpen()) {
                <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16m-7 6h7" stroke-width="2" stroke-linecap="round" /></svg>
              } @else {
                <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round" /></svg>
              }
            </button>
          </div>
        </div>
      </nav>

      @if (isMenuOpen()) {
        <div class="fixed inset-0 z-50 bg-[#030712]/95 backdrop-blur-sm flex flex-col pt-24 px-6 animate-in fade-in duration-200">
          <button (click)="isMenuOpen.set(false)" class="absolute top-6 right-6 p-3 text-slate-400 hover:text-white transition-colors cursor-pointer">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <nav class="flex flex-col space-y-4">
            <a routerLink="/" (click)="isMenuOpen.set(false)" class="flex items-center justify-between w-full px-4 py-3 bg-white/5 rounded-xl text-white text-lg font-semibold hover:bg-indigo-600 transition-colors cursor-pointer">
              <span>Home</span>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
            </a>
            <button (click)="launch(); isMenuOpen.set(false)" class="w-full px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-all active:scale-95 cursor-pointer">
              Sign In
            </button>
          </nav>
        </div>
      }

      <main class="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <header class="mb-12">
          <h1 class="text-4xl md:text-6xl font-black mb-4 tracking-tight">Discover <span class="text-indigo-500 italic">Expertise.</span></h1>
          <p class="text-slate-400 text-lg max-w-2xl font-medium">
            Sovereign training from industry leaders. Built in private workspaces, shared with the world.
          </p>
        </header>

        <div class="relative mb-12">
          <div class="flex gap-3 overflow-x-auto pb-6 no-scrollbar scroll-smooth items-center -mx-6 px-6 md:mx-0 md:px-0">
            <button 
              (click)="activeCategory.set('All')"
              [class]="activeCategory() === 'All' ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20' : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/10'"
              class="px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap active:scale-95 cursor-pointer">
              All
            </button>

            @for (cat of categories(); track cat.id) {
              <button 
                (click)="activeCategory.set(cat.name)"
                [class]="activeCategory() === cat.name ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/10'"
                class="px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap active:scale-95 cursor-pointer">
                {{ cat.name }}
              </button>
            }

            <div id="categorySentinel" class="min-w-10 flex items-center justify-center">
              @if (isLoadingCategories()) {
                <div class="size-4 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              }
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          @for (course of filteredCourses(); track course.id) {
            <div class="group bg-white/2 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-indigo-500/40 transition-all duration-500">
              <div [class]="'h-40 flex items-end px-8 pb-4 relative ' + course.accentClass">
                <div class="absolute inset-0 bg-linear-to-t from-[#030712] to-transparent"></div>
                <div class="relative z-10 size-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center">
                   <svg class="size-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
              </div>
              <div class="p-8 pt-2">
                <div class="flex items-center gap-2 mb-4">
                  <span class="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">{{ course.modules }} Modules</span>
                  <span class="text-[10px] text-slate-700 font-bold uppercase">•</span>
                  <span class="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{{ course.lessons }} Lessons</span>
                </div>
                <h3 class="text-2xl font-black mb-3 leading-tight group-hover:text-indigo-400 transition-colors uppercase italic tracking-tighter">{{ course.title }}</h3>
                <div class="mb-8 opacity-60"><span class="text-[10px] text-slate-400 font-black uppercase tracking-widest">Protocol by {{ course.partner }}</span></div>
                <button class="w-full py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shadow-xl">View Curriculum</button>
              </div>
            </div>
          }
        </div>
      </main>
    </div>
  `,
  styles: [`.no-scrollbar::-webkit-scrollbar { display: none; }`]
})
export class Explore implements OnInit, OnDestroy {
  private categoryService = inject(CategoryService);
  private readonly keycloak = inject(Keycloak);

  isMenuOpen = signal(false);
  activeCategory = signal('All');
  categories = signal<any[]>([]);
  categoryPage = 0;
  isLastPage = false;
  isLoadingCategories = signal(false);
  
  private destroy$ = new Subject<void>();
  private observer?: IntersectionObserver;

  courses = signal<Course[]>([
    { id: '1', title: 'Enterprise Spring Boot Architecture', partner: 'DevStudio', category: 'Software Engineering', accentClass: 'bg-emerald-500/10', modules: 4, lessons: 24 },
    { id: '2', title: 'Generative AI Workflows', partner: 'CreativeLab', category: 'Generative AI', accentClass: 'bg-purple-500/10', modules: 3, lessons: 12 },
    { id: '3', title: 'Sovereign Data Protocols', partner: 'LegalFlow', category: 'Cyber Security', accentClass: 'bg-red-500/10', modules: 5, lessons: 30 },
    { id: '4', title: 'High-Growth Tech Leadership', partner: 'Amatum Academy', category: 'Leadership', accentClass: 'bg-indigo-500/10', modules: 3, lessons: 15 },
  ]);

  constructor() {
    effect(() => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = this.isMenuOpen() ? 'hidden' : 'auto';
      }
    });
  }

  ngOnInit() {
    this.fetchInitialCategories();
    this.initInfiniteScroll();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.observer?.disconnect();
  }

  async launch() {
    try {
      await this.keycloak.login({ redirectUri: window.location.origin + '/auth/callback' });
    } catch (error) {
      console.error('Keycloak login trigger failed:', error);
    }
  }

  private fetchInitialCategories() {
    this.categoryPage = 0;
    this.loadMoreCategories();
  }

  private initInfiniteScroll() {
    this.observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !this.isLoadingCategories() && !this.isLastPage) {
        this.categoryPage++;
        this.loadMoreCategories();
      }
    }, { threshold: 0.1, rootMargin: '0px 100px 0px 0px' });

    const sentinel = document.querySelector('#categorySentinel');
    if (sentinel) this.observer.observe(sentinel);
  }

  private loadMoreCategories() {
    if (this.isLoadingCategories() || this.isLastPage) return;
    this.isLoadingCategories.set(true);
    this.categoryService.getAllCategories(this.categoryPage, 8).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res) => {
        const apiData = res._embedded?.categoryResponseList || [];
        this.isLastPage = !res._links.next;
        this.categories.update(current => [...current, ...apiData]);
        this.isLoadingCategories.set(false);
      },
      error: () => this.isLoadingCategories.set(false)
    });
  }

  filteredCourses = computed(() => {
    const active = this.activeCategory();
    return active === 'All' ? this.courses() : this.courses().filter(c => c.category === active);
  });
}
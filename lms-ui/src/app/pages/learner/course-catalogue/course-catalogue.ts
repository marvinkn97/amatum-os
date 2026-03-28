import { 
  Component, 
  signal, 
  computed, 
  ElementRef, 
  ViewChild, 
  AfterViewInit, 
  inject, 
  DestroyRef, 
  HostListener 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Course {
  id: string;
  title: string;
  partner: string;
  category: string;
  accentClass: string;
  modules: number;
  lessons: number;
  description: string;
}

@Component({
  selector: 'app-course-marketplace',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20 px-6">
      
      <header class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
        <div>
          <h1 class="text-md font-black text-white italic tracking-tighter mb-2 uppercase">Courses</h1>
          <p class="text-slate-500 text-sm font-medium">Browse sovereign training from certified partners.</p>
        </div>

        <div class="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1.5 backdrop-blur-3xl w-full md:w-auto">
          <div class="relative flex-1 md:w-64 group">
            <svg class="absolute left-4 top-1/2 -translate-y-1/2 size-3.5 text-slate-600 group-focus-within:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-width="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              [ngModel]="searchQuery()" 
              (ngModelChange)="searchQuery.set($event)"
              type="text" 
              placeholder="Filter courses..."
              class="w-full bg-transparent border-none py-2 pl-10 pr-4 text-[11px] font-bold text-white placeholder:text-slate-600 focus:ring-0 uppercase tracking-widest"
            />
          </div>

          <div class="h-4 w-px bg-white/10 mx-1"></div>

          <div class="relative">
            <button 
              (click)="toggleDropdown($event)"
              class="flex items-center gap-3 px-4 py-2 hover:bg-white/5 rounded-xl transition-all group">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white">
                {{ activeCategory() }}
              </span>
              <svg class="size-3 text-slate-600 group-hover:text-white transition-transform" [class.rotate-180]="isDropdownOpen()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-width="3" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            @if (isDropdownOpen()) {
              <div class="absolute top-[calc(100%+8px)] right-0 w-48 bg-[#0b1120] border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl p-1 backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-150">
                @for (cat of categories(); track cat) {
                  <button 
                    (click)="selectCategory(cat)"
                    class="w-full text-left px-4 py-2.5 rounded-lg hover:bg-indigo-600 transition-all">
                    <span class="text-[9px] font-black uppercase tracking-widest" [class.text-indigo-400]="activeCategory() === cat" [class.text-white]="activeCategory() !== cat">
                      {{ cat }}
                    </span>
                  </button>
                }
              </div>
            }
          </div>
        </div>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        @for (course of filteredCourses(); track course.id) {
          <div class="group bg-white/2 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-indigo-500/40 transition-all duration-500 flex flex-col backdrop-blur-md">
            
            <div [class]="'h-40 relative ' + course.accentClass">
              <div class="absolute inset-0 bg-linear-to-t from-[#030712] to-transparent"></div>
              <div class="absolute bottom-4 left-8 size-12 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/20 group-hover:text-indigo-400 transition-colors">
                <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>

            <div class="p-8 pt-4 flex flex-col flex-1">
              <div class="flex items-center gap-2 mb-4">
                <span class="text-[8px] font-black text-indigo-400 uppercase tracking-widest">{{ course.modules }} Modules</span>
                <span class="text-[8px] font-black text-slate-700 uppercase tracking-widest">•</span>
                <span class="text-[8px] font-black text-slate-500 uppercase tracking-widest">{{ course.category }}</span>
              </div>

              <h3 class="text-xl font-black text-white mb-3 italic tracking-tighter leading-tight group-hover:text-indigo-400 transition-colors">
                {{ course.title }}
              </h3>
              
              <div class="mt-auto pt-6 flex items-center justify-between">
                <div class="flex flex-col">
                  <span class="text-[8px] font-black text-slate-600 uppercase tracking-widest">Partner</span>
                  <span class="text-xs text-white font-bold italic">{{ course.partner }}</span>
                </div>
                
                <button class="size-11 bg-white text-black rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shadow-lg">
                  <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-width="3" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        }
      </div>

      <div #sentinel class="py-12 flex justify-center">
        @if (isLoading()) {
          <div class="animate-pulse text-[9px] font-black text-slate-600 uppercase tracking-[0.5em]">Fetching More...</div>
        }
      </div>
    </div>
  `
})
export class CourseCatalogueComponent implements AfterViewInit {
  @ViewChild('sentinel') sentinel!: ElementRef;
  private destroyRef = inject(DestroyRef);

  searchQuery = signal('');
  activeCategory = signal('All');
  isDropdownOpen = signal(false);
  isLoading = signal(false);
  hasMore = signal(true);
  
  categories = signal(['All', 'Development', 'Design', 'Business', 'Security']);
  courses = signal<Course[]>([
    { id: '1', title: 'Enterprise Spring Boot', partner: 'DevStudio', category: 'Development', accentClass: 'bg-emerald-500/10', modules: 4, lessons: 24, description: 'Advanced Backend.' },
    { id: '2', title: 'UI/UX Sovereign Systems', partner: 'CreativeLab', category: 'Design', accentClass: 'bg-indigo-500/10', modules: 3, lessons: 12, description: 'Lumina Design.' }
  ]);

  filteredCourses = computed(() => {
    let res = this.courses();
    const q = this.searchQuery().toLowerCase();
    const cat = this.activeCategory();
    if (q) res = res.filter(c => c.title.toLowerCase().includes(q) || c.partner.toLowerCase().includes(q));
    if (cat !== 'All') res = res.filter(c => c.category === cat);
    return res;
  });

  ngAfterViewInit() {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !this.isLoading() && this.hasMore()) this.loadNext();
    }, { rootMargin: '100px' });
    obs.observe(this.sentinel.nativeElement);
    this.destroyRef.onDestroy(() => obs.disconnect());
  }

  loadNext() {
    this.isLoading.set(true);
    setTimeout(() => {
      // Mock fetch
      this.isLoading.set(false);
      this.hasMore.set(false); // End for now
    }, 800);
  }

  toggleDropdown(e: Event) {
    e.stopPropagation();
    this.isDropdownOpen.update(v => !v);
  }

  selectCategory(cat: string) {
    this.activeCategory.set(cat);
    this.isDropdownOpen.set(false);
  }

  @HostListener('document:click')
  close() { this.isDropdownOpen.set(false); }
}
import { CommonModule } from '@angular/common';
import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router';

interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  isRemote: boolean;
  type: 'Full-time' | 'Part-time' | 'Contract';
  salary: string;
  postedDate: string;
  category: string;
}

@Component({
  selector: 'app-browse-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RouterLink],
  host: { class: 'dark block min-h-screen bg-[#030712] text-slate-100 antialiased selection:bg-emerald-500/30' },
  template: `
    <!-- Background Accents -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full"></div>
      <div class="absolute bottom-[20%] -right-[10%] w-[30%] h-[30%] bg-blue-600/5 blur-[120px] rounded-full"></div>
    </div>

    <!-- Navigation -->
    <nav class="fixed top-0 w-full z-40 border-b border-white/5 backdrop-blur-xl bg-[#030712]/50">
      <div class="max-w-7xl mx-auto px-4 md:px-6 h-16 flex justify-between items-center">
        <!-- Logo -->
        <div routerLink="/" class="flex items-center gap-2 font-black text-xl tracking-tighter cursor-pointer">
          <div class="size-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-sm shadow-lg shadow-emerald-600/20">A</div>
          AMATUM<span class="text-emerald-500 ml-1 text-xs uppercase tracking-[0.2em]">Opus</span>
        </div>

        <!-- Desktop Menu -->
        <div class="hidden md:flex items-center gap-8">
          <a routerLink="/" class="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Home</a>
          <button (click)="launch()" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-full transition-all active:scale-95 shadow-lg shadow-emerald-900/20 cursor-pointer">
            Sign In
          </button>
        </div>

        <!-- Mobile Toggle -->
        <div class="flex md:hidden items-center">
          <button (click)="isMenuOpen.set(!isMenuOpen())" class="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer">
            <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16m-7 6h7" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </nav>

    <!-- Mobile Menu Overlay -->
    @if (isMenuOpen()) {
      <div class="fixed inset-0 z-50 bg-[#030712]/98 backdrop-blur-md flex flex-col pt-24 px-6">
        <button (click)="isMenuOpen.set(false)" class="absolute top-6 right-6 p-3 text-slate-400 hover:text-white transition-colors cursor-pointer" aria-label="Close menu">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <nav class="flex flex-col space-y-4">
          <a routerLink="/" (click)="isMenuOpen.set(false)" class="flex items-center justify-between w-full px-4 py-4 bg-white/5 rounded-2xl text-white text-lg font-semibold">Home</a>
          <button (click)="launch(); isMenuOpen.set(false)" class="w-full px-6 py-4 bg-emerald-600 text-white font-bold rounded-2xl cursor-pointer">Sign In</button>
        </nav>
      </div>
    }

    <!-- Content -->
    <div class="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
      <header class="max-w-3xl mb-16">
        <h1 class="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4">
          Open <span class="text-emerald-500">Roles</span>
        </h1>
        <p class="text-slate-400 text-lg font-medium leading-relaxed">
          The Opus network hosts verified institutional opportunities.
        </p>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Sidebar -->
        <aside class="lg:col-span-3 space-y-8 lg:sticky lg:top-24 order-2 lg:order-1">
          <div class="p-6 rounded-3xl bg-white/2 border border-white/5 backdrop-blur-sm">
            <h2 class="text-sm font-black uppercase tracking-widest text-white mb-6">Refine Search</h2>
            <div class="space-y-6">
              <div>
                <label class="text-[10px] font-bold text-slate-500 uppercase block mb-2">Keyword</label>
                <input [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" type="text" placeholder="Search roles..."
                  class="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500/50 outline-none transition-all" />
              </div>
              <div>
                <label class="text-[10px] font-bold text-slate-500 uppercase block mb-3">Employment Type</label>
                <div class="flex flex-wrap gap-2">
                  @for (type of ['Full-time', 'Part-time', 'Contract']; track type) {
                    <button (click)="toggleType(type)" [class]="selectedTypes().includes(type) ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-white/5 border-white/5 text-slate-400'"
                      class="px-3 py-1.5 rounded-lg border text-xs font-bold transition-all hover:border-white/20 cursor-pointer">
                      {{ type }}
                    </button>
                  }
                </div>
              </div>
              <div class="pt-4 border-t border-white/5">
                <label class="flex items-center justify-between cursor-pointer group">
                  <span class="text-xs font-bold text-slate-400 group-hover:text-white">Remote Only</span>
                  <input type="checkbox" [checked]="remoteOnly()" (change)="remoteOnly.set(!remoteOnly())" class="accent-emerald-500 size-4">
                </label>
              </div>
            </div>
          </div>
        </aside>

        <!-- Job List -->
        <main class="lg:col-span-9 space-y-4 order-1 lg:order-2">
          @for (job of filteredJobs(); track job.id) {
            <div class="group p-6 md:p-8 rounded-[2.5rem] bg-linear-to-b from-white/[0.04] to-transparent border border-white/5 hover:border-emerald-500/20 transition-all duration-300 shadow-xl">
              <div class="flex flex-col md:flex-row justify-between gap-6 mb-6">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <span class="text-[10px] font-black text-emerald-500 tracking-widest uppercase">{{ job.company }}</span>
                    <span class="size-1 rounded-full bg-slate-700"></span>
                    <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{{ job.postedDate }}</span>
                  </div>
                  <h2 class="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors mb-3">{{ job.title }}</h2>
                  <p class="text-slate-400 text-sm leading-relaxed max-w-2xl line-clamp-2">{{ job.description }}</p>
                </div>
                <div class="flex flex-col items-start md:items-end gap-2 shrink-0">
                  <span class="text-xl font-black text-white tracking-tight">{{ job.salary }}</span>
                  <span class="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">Institutional Pay</span>
                </div>
              </div>

              <div class="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/5">
                <div class="flex flex-wrap items-center gap-3">
                  <div class="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5 text-xs font-bold text-slate-300">
                    {{ job.type }}
                  </div>
                  <div class="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5 text-xs font-bold text-slate-300">
                    {{ job.isRemote ? 'Remote' : job.location }}
                  </div>
                </div>
                <button (click)="launch()" class="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#030712] font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-emerald-500 hover:text-white transition-all active:scale-95 shadow-lg cursor-pointer">
                  View Details
                </button>
              </div>
            </div>
          } @empty {
            <div class="p-20 text-center rounded-[2.5rem] border border-dashed border-white/10">
              <p class="text-slate-500 font-medium tracking-tight">No mandates found.</p>
            </div>
          }
        </main>
      </div>
    </div>
  `,
})
export class BrowseJobsComponent {
  isMenuOpen = signal(false);
  searchQuery = signal('');
  selectedTypes = signal<string[]>([]);
  remoteOnly = signal(false);

  private jobs = signal<Job[]>([
    {
      id: '1',
      title: 'Senior Smart Contract Engineer',
      company: 'AMATUM LABS',
      description: 'You will lead the development of secure, institutional-grade smart contracts for the Opus ecosystem.',
      location: 'London, UK',
      isRemote: true,
      type: 'Full-time',
      salary: '$160k - $240k',
      postedDate: '2 HOURS AGO',
      category: 'Engineering'
    },
    {
      id: '2',
      title: 'Global Operations Director',
      company: 'OPUS SYSTEMS',
      description: 'Driving operational excellence across four continents in high-growth fintech environments.',
      location: 'New York, NY',
      isRemote: false,
      type: 'Full-time',
      salary: '$200k - $300k',
      postedDate: '5 HOURS AGO',
      category: 'Operations'
    }
  ]);

  filteredJobs = computed(() => {
    return this.jobs().filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(this.searchQuery().toLowerCase()) ||
                            job.company.toLowerCase().includes(this.searchQuery().toLowerCase());
      const matchesType = this.selectedTypes().length === 0 || this.selectedTypes().includes(job.type as string);
      const matchesRemote = !this.remoteOnly() || job.isRemote;
      return matchesSearch && matchesType && matchesRemote;
    });
  });

  toggleType(type: string) {
    const current = this.selectedTypes();
    this.selectedTypes.set(current.includes(type) ? current.filter(t => t !== type) : [...current, type]);
  }

  async launch() {}
}
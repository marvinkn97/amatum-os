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
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full"></div>
      <div class="absolute bottom-[20%] -right-[10%] w-[30%] h-[30%] bg-blue-600/5 blur-[120px] rounded-full"></div>
    </div>

    <nav class="fixed top-0 w-full z-40 border-b border-white/5 backdrop-blur-xl bg-[#030712]/50">
      <div class="max-w-7xl mx-auto px-4 md:px-6 h-16 flex justify-between items-center">
        <div routerLink="/" class="flex items-center gap-2 font-black text-xl tracking-tighter cursor-pointer">
          <div class="size-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-sm shadow-lg shadow-emerald-600/20">A</div>
          AMATUM<span class="text-emerald-500 ml-1 text-xs uppercase tracking-[0.2em]">Opus</span>
        </div>

        <div class="hidden md:flex items-center gap-8">
          <button (click)="launch()" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-full transition-all active:scale-95 shadow-lg shadow-emerald-900/20">
            Sign In
          </button>
        </div>

        <div class="flex md:hidden items-center">
          <button (click)="isMenuOpen.set(!isMenuOpen())" class="p-2 text-slate-400 hover:text-white transition-colors">
            <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              @if (!isMenuOpen()) {
                <path d="M4 6h16M4 12h16m-7 6h7" stroke-width="2" stroke-linecap="round" />
              } @else {
                <path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round" />
              }
            </svg>
          </button>
        </div>
      </div>
    </nav>

    @if (isMenuOpen()) {
      <div class="fixed inset-0 z-50 bg-[#030712]/98 backdrop-blur-md flex flex-col pt-24 px-6">
        <nav class="flex flex-col space-y-4">
          <a routerLink="/explore" (click)="isMenuOpen.set(false)" class="flex items-center justify-between w-full px-4 py-4 bg-white/5 rounded-2xl text-white text-lg font-semibold">
            <span>Browse Jobs</span>
            <svg class="size-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
          <button (click)="launch(); isMenuOpen.set(false)" class="w-full px-6 py-4 bg-emerald-600 text-white font-bold rounded-2xl">
            Sign In
          </button>
        </nav>
      </div>
    }

    <div class="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
      <header class="max-w-3xl mb-16">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-6 tracking-wide uppercase">
          Market Intelligence
        </div>
        <h1 class="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4">
          Open <span class="text-emerald-500">Mandates</span>
        </h1>
        <p class="text-slate-400 text-lg font-medium leading-relaxed">
          The Opus network hosts verified institutional opportunities.
        </p>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <aside class="lg:col-span-3 space-y-8 lg:sticky lg:top-24 order-2 lg:order-1">
          <div class="p-6 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
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
                      class="px-3 py-1.5 rounded-lg border text-xs font-bold transition-all hover:border-white/20">
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
                  <h2 class="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors mb-3">
                    {{ job.title }}
                  </h2>
                  <p class="text-slate-400 text-sm leading-relaxed max-w-2xl line-clamp-2">
                    {{ job.description }}
                  </p>
                </div>
                <div class="flex flex-col items-start md:items-end gap-2 shrink-0">
                  <span class="text-xl font-black text-white tracking-tight">{{ job.salary }}</span>
                  <span class="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                    Institutional Pay
                  </span>
                </div>
              </div>

              <div class="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/5">
                <div class="flex flex-wrap items-center gap-3">
                  <div class="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5 text-xs font-bold text-slate-300">
                    <svg class="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round"/></svg>
                    {{ job.type }}
                  </div>
                  <div class="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5 text-xs font-bold text-slate-300">
                    <svg class="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke-width="2" stroke-linecap="round"/></svg>
                    {{ job.isRemote ? 'Remote' : job.location }}
                  </div>
                </div>

                <button (click)="launch()" class="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#030712] font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-emerald-500 hover:text-white transition-all active:scale-95 shadow-lg">
                  View Details
                  <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 8l4 4m0 0l-4 4m4-4H3" stroke-width="2" stroke-linecap="round"/></svg>
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
      description: 'You will lead the development of secure, institutional-grade smart contracts for the Opus ecosystem. Requires 5+ years of experience in Solidity and a deep understanding of EVM security patterns, gas optimization, and multi-signature wallet architecture.',
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
      description: 'Driving operational excellence across four continents. This role requires a background in high-growth fintech environments and a proven track record of managing distributed teams and complex regulatory compliance frameworks.',
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
    if (current.includes(type)) {
      this.selectedTypes.set(current.filter(t => t !== type));
    } else {
      this.selectedTypes.set([...current, type]);
    }
  }

  async launch() {
    // Auth logic
  }
}
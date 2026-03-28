import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

interface StudyModule {
  id: number;
  title: string;
  duration: string;
  isLocked: boolean;
  isCompleted: boolean;
  description: string;
}

@Component({
  selector: 'app-enrollment-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [DecimalPipe],
  template: `
    <div class="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
      
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div class="space-y-2">
          <nav class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
            <a routerLink="/learner" class="hover:text-indigo-400 transition-colors">My Enrollments</a>
            <svg class="size-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="3" d="M9 5l7 7-7 7" /></svg>
            <span class="text-white/40">Active Session</span>
          </nav>
          <h1 class="text-4xl font-black text-white italic tracking-tighter leading-none">
            {{ enrollmentTitle() }}
          </h1>
        </div>

        <div class="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-6 py-3 backdrop-blur-md">
          <div class="text-right">
            <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Overall Progress</p>
            <p class="text-xs font-bold text-white">{{ completionPercentage() }}% Complete</p>
          </div>
          <div class="size-10 rounded-full border-2 border-white/5 flex items-center justify-center relative">
             <svg class="size-full -rotate-90">
                <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" stroke-width="3" class="text-white/5" />
                <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" stroke-width="3" 
                  class="text-indigo-500 transition-all duration-1000"
                  [style.stroke-dasharray]="113.1"
                  [style.stroke-dashoffset]="113.1 - (113.1 * completionPercentage() / 100)" />
             </svg>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <div class="lg:col-span-8 space-y-6">
          <div class="relative aspect-video bg-black rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl group ring-1 ring-white/10">
            <div class="absolute inset-0 flex items-center justify-center bg-linear-to-br from-indigo-900/20 via-black to-black">
               <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
               <button class="size-24 bg-white/5 backdrop-blur-2xl rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 group-hover:bg-indigo-600 transition-all duration-500 cursor-pointer shadow-2xl shadow-indigo-500/20 group-hover:shadow-indigo-500/40">
                 <svg class="size-10 text-white fill-current translate-x-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
               </button>
            </div>
            
            <div class="absolute bottom-0 inset-x-0 p-10 bg-linear-to-t from-black via-black/60 to-transparent">
              <span class="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 inline-block">
                Module {{ activeModule().id | number:'2.0' }}
              </span>
              <h2 class="text-3xl font-black text-white italic tracking-tighter">{{ activeModule().title }}</h2>
            </div>
          </div>

          <div class="bg-white/2 border border-white/5 p-10 rounded-[3rem] backdrop-blur-3xl relative overflow-hidden group">
            <div class="relative z-10 space-y-4">
              <h3 class="text-xs font-black text-indigo-400 uppercase tracking-[0.4em]">Detailed Syllabus Context</h3>
              <p class="text-base text-slate-400 leading-relaxed font-medium max-w-2xl">
                {{ activeModule().description }}
              </p>
            </div>
            <div class="absolute -right-20 -top-20 size-60 bg-indigo-500/5 blur-[100px] rounded-full group-hover:bg-indigo-500/10 transition-colors"></div>
          </div>
        </div>

        <div class="lg:col-span-4 sticky top-8">
          <div class="bg-[#0b1120]/80 border border-white/5 rounded-[3rem] backdrop-blur-3xl flex flex-col h-full overflow-hidden shadow-2xl">
            <div class="p-8 border-b border-white/5 flex items-center justify-between">
              <h3 class="text-[11px] font-black text-white uppercase tracking-[0.5em] opacity-60">Curriculum</h3>
              <div class="size-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
            
            <div class="flex-1 overflow-y-auto p-4 space-y-3 max-h-162.5 custom-scrollbar">
              @for (mod of modules(); track mod.id) {
                <button 
                  (click)="setActiveModule(mod.id)"
                  [class.bg-white/5]="activeModuleId() === mod.id"
                  [class.border-indigo-500/40]="activeModuleId() === mod.id"
                  [class.opacity-50]="mod.isLocked"
                  [disabled]="mod.isLocked"
                  class="w-full flex items-center gap-5 p-5 rounded-3xl border border-transparent transition-all text-left group hover:bg-white/3 disabled:cursor-not-allowed cursor-pointer"
                >
                  <div class="size-10 shrink-0 rounded-2xl flex items-center justify-center text-xs font-black border transition-all duration-300"
                    [ngClass]="mod.isCompleted ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-white/5 border-white/10 text-slate-500 group-hover:border-indigo-500/50 group-hover:text-white'">
                    @if (mod.isCompleted) {
                      <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    } @else {
                      {{ mod.id | number:'2.0' }}
                    }
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <p class="text-[13px] font-bold text-white truncate transition-colors group-hover:text-indigo-300">{{ mod.title }}</p>
                    <div class="flex items-center gap-2 mt-1">
                       <span class="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{{ mod.duration }}</span>
                       @if (mod.isLocked) {
                         <span class="size-1 rounded-full bg-slate-700"></span>
                         <svg class="size-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                       }
                    </div>
                  </div>
                </button>
              }
            </div>

            <div class="p-8 bg-white/2 border-t border-white/5">
               <button class="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-lg shadow-indigo-500/20 cursor-pointer">
                 Mark as Complete
               </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.1); border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.3); }
  `]
})
export class LessonComponent implements OnInit {
  private route = inject(ActivatedRoute);
  
  enrollmentTitle = signal('Advanced Fullstack Architecture');
  activeModuleId = signal(1);

  modules = signal<StudyModule[]>([
    { id: 1, title: 'Architecture Deep Dive', duration: '12:45', isLocked: false, isCompleted: true, description: 'In this module, we explore the core principles of multi-tenant architecture and how to isolate data effectively across different organizational workspaces.' },
    { id: 2, title: 'Multi-tenant Data Isolation', duration: '24:20', isLocked: false, isCompleted: false, description: 'A technical session on database schemas versus row-level filtering. We will discuss the performance trade-offs of each approach in a Spring Boot environment.' },
    { id: 3, title: 'Keycloak Integration Patterns', duration: '18:10', isLocked: false, isCompleted: false, description: 'Learn how to use the Keycloak Organization API to manage private academies and user roles within a complex multi-tenant environment.' },
    { id: 4, title: 'Production Deployment', duration: '32:05', isLocked: true, isCompleted: false, description: 'Final steps to move your LMS into a production-ready state using Docker, Kubernetes, and secure ingress controllers.' },
  ]);

  activeModule = computed(() => 
    this.modules().find(m => m.id === this.activeModuleId()) || this.modules()[0]
  );

  completionPercentage = computed(() => {
    const completed = this.modules().filter(m => m.isCompleted).length;
    return Math.round((completed / this.modules().length) * 100);
  });

  ngOnInit() {
    // Logic to resume from the last incomplete module
    const resumeAt = this.modules().find(m => !m.isCompleted);
    if (resumeAt) this.activeModuleId.set(resumeAt.id);
  }

  setActiveModule(id: number) {
    this.activeModuleId.set(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
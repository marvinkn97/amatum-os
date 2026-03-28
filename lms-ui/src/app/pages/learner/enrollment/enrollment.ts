import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
}

interface Module {
  id: number;
  title: string;
  progress: number; // 0 to 100
  lessons: Lesson[];
  isLocked: boolean;
}

@Component({
  selector: 'app-enrollment-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-1000 pb-20">
      
      <div class="relative p-12 rounded-[3rem] bg-white/2 border border-white/5 overflow-hidden backdrop-blur-3xl">
        <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div class="space-y-4">
            <span class="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">
              Active Enrollment
            </span>
            <h1 class="text-6xl font-black text-white italic tracking-tighter leading-none">
              {{ enrollment().title }}
            </h1>
            <p class="text-slate-500 font-bold uppercase text-xs tracking-widest">
              Led by {{ enrollment().instructor }} • {{ enrollment().totalModules }} Modules
            </p>
          </div>

          <div class="flex flex-col items-end gap-2">
            <div class="text-right">
              <span class="text-4xl font-black text-white italic tracking-tighter">{{ totalProgress() }}%</span>
              <p class="text-[10px] font-black text-slate-600 uppercase tracking-widest">Completion</p>
            </div>
            <button class="px-8 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl shadow-white/10 cursor-pointer">
              Resume Journey
            </button>
          </div>
        </div>
        
        <div class="absolute -right-20 -bottom-20 size-80 bg-indigo-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div class="space-y-6">
        <h3 class="text-[11px] font-black text-white uppercase tracking-[0.5em] opacity-40 ml-4">Curriculum Structure</h3>
        
        @for (module of modules(); track module.id) {
          <div class="group bg-white/1 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-md hover:border-white/10 transition-all">
            
            <div class="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 bg-white/[0.01]">
              <div class="flex items-center gap-6">
                <div class="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-black text-white italic">
                  {{ module.id | number:'2.0' }}
                </div>
                <div>
                  <h4 class="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{{ module.title }}</h4>
                  <p class="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">{{ module.lessons.length }} Lessons • {{ module.progress }}% Complete</p>
                </div>
              </div>

              <div class="w-full md:w-64 space-y-2">
                <div class="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div class="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000" [style.width.%]="module.progress"></div>
                </div>
              </div>
            </div>

            <div class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (lesson of module.lessons; track lesson.id) {
                <button 
                  [routerLink]="['/learner/lesson', lesson.id]"
                  class="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-indigo-500/30 transition-all group/lesson cursor-pointer"
                >
                  <div class="flex items-center gap-3">
                    <div class="size-8 rounded-lg flex items-center justify-center border transition-colors"
                      [ngClass]="lesson.completed ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-white/5 border-white/10 text-slate-600'">
                      @if (lesson.completed) {
                        <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path d="M5 13l4 4L19 7" /></svg>
                      } @else {
                        <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M14.75 9l-5 5 5 5m-9-10h10" /></svg>
                      }
                    </div>
                    <span class="text-xs font-bold text-slate-300 group-hover/lesson:text-white transition-colors">{{ lesson.title }}</span>
                  </div>
                  <span class="text-[9px] font-black text-slate-600 uppercase">{{ lesson.duration }}</span>
                </button>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class EnrollmentComponent {
  enrollment = signal({
    title: 'Advanced Fullstack Architecture',
    instructor: 'Deborah Kurata',
    totalModules: 4
  });

  modules = signal<Module[]>([
    {
      id: 1,
      title: 'Foundation & Multi-tenancy',
      progress: 100,
      isLocked: false,
      lessons: [
        { id: 'l1', title: 'Course Introduction', duration: '05:20', completed: true },
        { id: 'l2', title: 'Why Multi-tenancy?', duration: '12:45', completed: true },
        { id: 'l3', title: 'Architecture Patterns', duration: '15:10', completed: true }
      ]
    },
    {
      id: 2,
      title: 'Identity Management with Keycloak',
      progress: 33,
      isLocked: false,
      lessons: [
        { id: 'l4', title: 'Setting up Keycloak', duration: '20:00', completed: true },
        { id: 'l5', title: 'Organization API Setup', duration: '18:30', completed: false },
        { id: 'l6', title: 'Role Based Access Control', duration: '22:15', completed: false }
      ]
    }
  ]);

  totalProgress = computed(() => {
    const mods = this.modules();
    return Math.round(mods.reduce((acc, m) => acc + m.progress, 0) / mods.length);
  });
}
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

interface Lesson {
  title: string;
  duration: string;
  isFreePreview: boolean;
}

interface Module {
  title: string;
  lessons: Lesson[];
}

@Component({
  selector: 'app-curriculum',
  standalone: true,
  imports: [CommonModule, RouterModule],
  host: { 'class': 'dark block' },
  template: `
    <div class="min-h-screen bg-[#030712] text-slate-100 font-sans antialiased">
      
      <nav class="fixed top-0 w-full z-[100] border-b border-white/5 backdrop-blur-xl bg-[#030712]/20">
        <div class="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div class="flex items-center gap-2 font-black text-xl tracking-tighter cursor-pointer" routerLink="/">
            <div class="size-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm">A</div>
            AMATUM<span class="text-indigo-600 ml-1 text-xs uppercase tracking-widest">Lumina</span>
          </div>
          <button (click)="signIn()" class="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-full hover:bg-indigo-500 transition-all">
            Unlock Course
          </button>
        </div>
      </nav>

      <main class="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        
        <div class="mb-12">
          <div class="flex items-center gap-3 mb-4">
             <span class="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold rounded-md uppercase tracking-widest border border-indigo-500/20">
               {{ courseCategory() }}
             </span>
             <span class="text-slate-600">•</span>
             <span class="text-sm text-slate-400 italic">Created by {{ partnerName() }}</span>
          </div>
          <h1 class="text-4xl md:text-6xl font-black mb-6 leading-tight">{{ courseTitle() }}</h1>
          <p class="text-slate-400 text-lg leading-relaxed mb-8">
            Master the core principles and advanced strategies in this comprehensive {{ modules().length }}-module journey.
          </p>
          
          <div class="flex gap-8 p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
            <div>
              <div class="text-[10px] uppercase font-bold text-slate-500 mb-1">Total Content</div>
              <div class="font-bold">8h 45m</div>
            </div>
            <div class="w-px h-8 bg-white/10"></div>
            <div>
              <div class="text-[10px] uppercase font-bold text-slate-500 mb-1">Modules</div>
              <div class="font-bold">{{ modules().length }} Steps</div>
            </div>
            <div class="w-px h-8 bg-white/10"></div>
            <div>
              <div class="text-[10px] uppercase font-bold text-slate-500 mb-1">Access</div>
              <div class="font-bold text-indigo-400">Full Lifetime</div>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <h2 class="text-2xl font-bold mb-8">Course Curriculum</h2>
          
          @for (mod of modules(); track mod.title; let i = $index) {
            <div class="group border border-white/5 bg-white/[0.01] rounded-3xl overflow-hidden hover:border-white/10 transition-colors">
              <div class="p-6 flex items-center justify-between bg-white/[0.02]">
                <div class="flex items-center gap-4">
                  <span class="size-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                    0{{ i + 1 }}
                  </span>
                  <h3 class="font-bold text-lg">{{ mod.title }}</h3>
                </div>
                <span class="text-xs font-bold text-slate-500 uppercase">{{ mod.lessons.length }} Lessons</span>
              </div>

              <div class="px-6 pb-4">
                @for (lesson of mod.lessons; track lesson.title) {
                  <div class="flex items-center justify-between py-4 border-t border-white/5 last:border-0 group/item">
                    <div class="flex items-center gap-4">
                      <div class="size-8 flex items-center justify-center rounded-full bg-slate-900 border border-white/5 text-slate-600">
                        @if (lesson.isFreePreview) {
                          <svg class="size-4 text-indigo-400" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.333-5.89a1.5 1.5 0 000-2.538L6.3 2.841z"/></svg>
                        } @else {
                          <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke-width="2" stroke-linecap="round"/></svg>
                        }
                      </div>
                      <span [class.text-slate-400]="!lesson.isFreePreview" class="text-sm font-medium">
                        {{ lesson.title }}
                      </span>
                    </div>
                    <div class="flex items-center gap-4">
                      <span class="text-[10px] font-mono text-slate-600">{{ lesson.duration }}</span>
                      @if (lesson.isFreePreview) {
                        <button (click)="preview()" class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest hover:underline">Preview</button>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <div class="mt-20 p-12 rounded-[3rem] bg-indigo-600 text-center relative overflow-hidden shadow-2xl shadow-indigo-600/20">
           <h2 class="text-3xl font-black mb-4 relative z-10">Ready to start your journey?</h2>
           <p class="text-indigo-100 mb-8 relative z-10 opacity-80">Join {{ partnerName() }} and {{ modules().length * 4 }}+ other students today.</p>
           <button (click)="signIn()" class="relative z-10 px-10 py-4 bg-white text-indigo-600 font-black rounded-2xl hover:scale-105 transition-all shadow-xl">
             Sign In to Enroll
           </button>
           <div class="absolute top-0 right-0 size-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        </div>
      </main>
    </div>
  `
})
export class Curriculum {
  courseTitle = signal('Enterprise Spring Boot Architecture');
  courseCategory = signal('Development');
  partnerName = signal('Amatum Academy');

  modules = signal<Module[]>([
    {
      title: 'Foundations & Setup',
      lessons: [
        { title: 'Introduction to Multi-tenancy', duration: '12:40', isFreePreview: true },
        { title: 'Project Structure & Gradle setup', duration: '15:20', isFreePreview: false },
        { title: 'Configuration Server Integration', duration: '08:15', isFreePreview: false }
      ]
    },
    {
      title: 'Identity & Security',
      lessons: [
        { title: 'Keycloak Organizations Overview', duration: '22:10', isFreePreview: false },
        { title: 'JWT Claims & Role Mapping', duration: '18:45', isFreePreview: false },
        { title: 'Securing the API-First Gateway', duration: '25:30', isFreePreview: false }
      ]
    }
  ]);

  signIn() { console.log('Redirecting to Keycloak login...'); }
  preview() { console.log('Opening free preview modal...'); }
}
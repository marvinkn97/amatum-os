import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
    
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        @for (stat of contentStats(); track stat.label) {
          <div
            class="group relative bg-white/1 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-xl overflow-hidden transition-all hover:border-indigo-500/30"
          >
            <div class="relative z-10 flex flex-col">
              <p class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">
                {{ stat.label }}
              </p>
              <div class="flex items-center justify-between">
                <h4 class="text-5xl font-black text-white italic tracking-tighter leading-none">
                  {{ stat.value }}
                </h4>
                <div
                  class="size-12 rounded-xl bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-all shrink-0"
                >
                  <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" [attr.d]="stat.icon" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div class="absolute -right-4 -bottom-4 size-24 bg-indigo-500/3 blur-2xl rounded-full pointer-events-none"></div>
          </div>
        }
      </div>
    </div>
  `,
})
export class ManagerDashboard {
  contentStats = signal([
    { 
      label: 'Total Courses', 
      value: '14', 
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' 
    },
    { 
      label: 'Modules', 
      value: '82', 
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' 
    },
    { 
      label: 'Lessons', 
      value: '342', 
      icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z' 
    },
    { 
      label: 'Active Tags', 
      value: '28', 
      icon: 'M7 7h.01M7 11h.01M7 15h.01M11 7h.01M11 11h.01M11 15h.01M15 7h.01M15 11h.01M15 15h.01' 
    }
  ]);
}
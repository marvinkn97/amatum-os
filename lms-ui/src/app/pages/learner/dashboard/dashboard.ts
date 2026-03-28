import { Component, computed, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-learner-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          class="group relative bg-white/1 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-xl overflow-hidden transition-all hover:border-emerald-500/30"
        >
          <div class="relative z-10 flex items-center justify-between">
            <div>
              <p class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
                Completed Courses
              </p>
              <h4 class="text-5xl font-black text-white italic tracking-tighter">
                {{ totalCompleted() }}
              </h4>
            </div>
            <div
              class="size-16 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all shrink-0"
            >
              <svg class="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>
          <div
            class="absolute -right-4 -bottom-4 size-32 bg-emerald-500/3 blur-[50px] rounded-full"
          ></div>
        </div>

        <div
          class="group relative bg-white/1 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-xl overflow-hidden transition-all hover:border-indigo-500/30"
        >
          <div class="relative z-10 flex items-center justify-between">
            <div>
              <p class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
                Active Courses
              </p>
              <h4 class="text-5xl font-black text-white italic tracking-tighter leading-none">
                {{ activeInContext() }}
              </h4>
            </div>
            <div
              class="size-16 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.1)] group-hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] transition-all shrink-0"
            >
              <svg class="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
          </div>
          <div
            class="absolute -right-4 -bottom-4 size-32 bg-indigo-500/3 blur-[50px] rounded-full pointer-events-none"
          ></div>
        </div>

        <div
          class="relative bg-white/1 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-xl flex flex-col justify-center border-l-indigo-500/30"
        >
          <p class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
            Context
          </p>
          <div class="flex items-center gap-3">
            <div
              class="size-2 rounded-full animate-pulse"
              [class]="isPublic() ? 'bg-emerald-500' : 'bg-indigo-500'"
            ></div>
            <h4 class="text-lg font-bold text-white uppercase italic tracking-tight">
              {{ isPublic() ? 'Public Marketplace' : 'Organization Training' }}
            </h4>
          </div>
          <p class="text-[9px] text-slate-600 font-bold uppercase mt-2 tracking-widest">
            {{ isPublic() ? 'Personal Learning Identity' : 'Authorized Access Active' }}
          </p>
        </div>
      </div>

      <div class="bg-white/1 border border-white/5 rounded-2xl overflow-hidden">
        <div
          class="px-10 py-8 border-b border-white/5 bg-white/1 flex justify-between items-center"
        >
          <h3 class="text-[11px] font-black text-white uppercase tracking-[0.5em] opacity-60">
            Learning Tracks
          </h3>
          <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Displaying {{ visibleCount() }} of {{ filteredEnrollments().length }}
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr
                class="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] border-b border-white/5"
              >
                <th class="px-10 py-6">Course Identity</th>
                <th class="px-10 py-6">Current Focus</th>
                <th class="px-10 py-6">Progress</th>
                <th class="px-10 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              @for (course of paginatedEnrollments(); track course.id) {
                <tr class="group hover:bg-white/2 transition-all">
                  <td class="px-10 py-8">
                    <div class="flex flex-col">
                      <span
                        class="text-base font-bold text-white group-hover:text-indigo-400 transition-colors leading-tight"
                        >{{ course.title }}</span
                      >
                      <span
                        class="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest"
                        >Prof. {{ course.instructor }}</span
                      >
                    </div>
                  </td>
                  <td class="px-10 py-8">
                    <div class="flex flex-col max-w-70">
                      <span class="text-xs text-slate-300 font-bold italic truncate">{{
                        course.currentModule
                      }}</span>
                      <span class="text-[9px] text-slate-600 font-black uppercase mt-1"
                        >Module {{ course.completedModules + 1 }} of {{ course.totalModules }}</span
                      >
                    </div>
                  </td>
                  <td class="px-10 py-8">
                    <div class="w-48">
                      <div
                        class="flex justify-between items-center mb-3 text-[10px] font-black italic text-white"
                      >
                        <span class="text-slate-500 not-italic uppercase tracking-tighter">{{
                          course.status
                        }}</span>
                        <span
                          >{{
                            ((course.completedModules / course.totalModules) * 100).toFixed(0)
                          }}%</span
                        >
                      </div>
                      <div class="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          class="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all duration-1000"
                          [style.width.%]="(course.completedModules / course.totalModules) * 100"
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td class="px-10 py-8 text-right">
                    <button
                      class="size-11 bg-white/3 border border-white/10 rounded-2xl inline-flex items-center justify-center text-slate-400 hover:bg-white hover:text-black hover:scale-105 transition-all cursor-pointer"
                    >
                      <svg
                        class="size-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2.5"
                      >
                        <path d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="p-8 flex justify-center border-t border-white/5 bg-white/1">
          @if (hasMore()) {
            <button
              (click)="loadMore()"
              class="px-8 py-3 rounded-xl border border-white/10 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-white hover:text-black transition-all group cursor-pointer"
            >
              <span class="group-hover:tracking-[0.2em] transition-all">Load More Courses</span>
            </button>
          } @else {
            <p class="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">
              End of Learning Tracks
            </p>
          }
        </div>
      </div>
    </div>
  `,
})
export class LearnerDashboardComponent {
  // Application Context
  activeOrgId = signal<string>('public');
  isPublic = computed(() => this.activeOrgId() === null);

  // Pagination / Scroll Logic
  private readonly PAGE_SIZE = 5;
  visibleCount = signal(5);

  private allEnrollments = signal<any[]>([
    {
      id: '1',
      title: 'Advanced Fullstack Architecture',
      instructor: 'Deborah Kurata',
      currentModule: 'Scalability with Kubernetes',
      completedModules: 4,
      totalModules: 12,
      orgId: null,
      status: 'In Progress',
    },
    {
      id: '2',
      title: 'Company Security Protocol',
      instructor: 'Cyber Team',
      currentModule: 'Auth Flows & Keycloak',
      completedModules: 1,
      totalModules: 5,
      orgId: null,
      status: 'Mandatory',
    },
    {
      id: '3',
      title: 'Clean Code principles',
      instructor: 'Uncle Bob',
      currentModule: 'Completed',
      completedModules: 10,
      totalModules: 10,
      orgId: null,
      status: 'Completed',
    },
    // Add more mock data here to test the scrolling...
  ]);

  // Filters logic
  filteredEnrollments = computed(() =>
    this.allEnrollments().filter((e) =>
      this.isPublic()
        ? e.orgId === 'public' && e.completedModules < e.totalModules
        : e.orgId !== 'public' && e.completedModules < e.totalModules,
    ),
  );

  // Sliced data for infinity scroll
  paginatedEnrollments = computed(() => this.filteredEnrollments().slice(0, this.visibleCount()));

  hasMore = computed(() => this.visibleCount() < this.filteredEnrollments().length);

  totalCompleted = computed(
    () => this.allEnrollments().filter((e) => e.completedModules === e.totalModules).length,
  );

  activeInContext = computed(() => this.filteredEnrollments().length);

  loadMore() {
    this.visibleCount.update((prev) => prev + this.PAGE_SIZE);
  }

  // Automatic infinite scroll on window scroll
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.documentElement.scrollHeight - 100;

    if (scrollPosition >= threshold && this.hasMore()) {
      this.loadMore();
    }
  }
}

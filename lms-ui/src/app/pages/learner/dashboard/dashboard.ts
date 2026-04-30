import { Component, computed, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-learner-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20  p-4 lg:p-8">
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

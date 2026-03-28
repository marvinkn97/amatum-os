import { CommonModule } from '@angular/common';
import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  inject,
  DestroyRef,
  signal,
} from '@angular/core';

interface Certificate {
  id: string;
  courseTitle: string;
  issueDate: string;
  organization: string;
  verificationId: string;
  accentColor: string;
}

@Component({
  selector: 'app-my-certificates',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20 px-4 md:px-6">
      <header
        class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10"
      >
        <div class="text-center md:text-left">
          <h1 class="text-md font-black text-white italic tracking-tighter mb-2 uppercase">
            Certifications
          </h1>
          <p class="text-slate-500 text-xs md:text-sm font-medium uppercase tracking-widest">
            Verified credentials.
          </p>
        </div>

        <div
          class="flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl px-6 py-3 backdrop-blur-3xl w-full md:w-auto"
        >
          <span
            class="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest"
          >
            {{ certificates().length }} Records Found
          </span>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        @for (cert of certificates(); track cert.id) {
          <div
            class="group bg-white/2 border border-white/5 rounded-[2.5rem] p-6 md:p-8 backdrop-blur-md hover:border-indigo-500/40 transition-all duration-500 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start lg:items-center"
          >
            <div
              [class]="
                'size-20 md:size-24 shrink-0 rounded-3xl flex items-center justify-center border border-white/10 relative overflow-hidden ' +
                cert.accentColor
              "
            >
              <div class="absolute inset-0 bg-linear-to-br from-white/10 to-transparent"></div>
              <svg
                class="size-8 md:size-10 text-white/40 group-hover:text-white transition-colors relative z-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-width="1.5"
                  d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z"
                />
              </svg>
            </div>

            <div
              class="flex-1 flex flex-col items-center md:items-start text-center md:text-left justify-center"
            >
              <div
                class="flex flex-col md:flex-row md:items-center justify-between w-full mb-1 gap-1"
              >
                <span
                  class="text-[8px] md:text-[9px] font-black text-indigo-400 uppercase tracking-widest"
                  >{{ cert.organization }}</span
                >
                <span class="text-[8px] font-mono text-slate-600 tracking-tighter">{{
                  cert.verificationId
                }}</span>
              </div>

              <h3
                class="text-lg md:text-xl font-black text-white italic tracking-tighter leading-tight group-hover:text-indigo-400 transition-colors"
              >
                {{ cert.courseTitle }}
              </h3>

              <p class="text-[9px] text-slate-500 font-bold uppercase mt-2 tracking-widest italic">
                Issued: {{ cert.issueDate }}
              </p>

              <div class="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6 mt-6">
                <button
                  class="text-[9px] font-black uppercase text-white hover:text-indigo-400 transition-all tracking-widest flex items-center gap-2 group/btn"
                >
                  <svg
                    class="size-4 text-slate-500 group-hover/btn:text-indigo-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download
                </button>
                <button
                  class="text-[9px] font-black uppercase text-slate-500 hover:text-white transition-all tracking-widest flex items-center gap-2 group/btn"
                >
                  <svg
                    class="size-4 text-slate-600 group-hover/btn:text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-width="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  Verify
                </button>
              </div>
            </div>
          </div>
        }
      </div>

      <div #sentinel class="w-full py-10 flex justify-center items-center">
        @if (isLoading()) {
          <div class="flex gap-2 items-center">
            <div
              class="size-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"
            ></div>
            <div
              class="size-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"
            ></div>
            <div class="size-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
            <span class="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] ml-2"
              >Loading</span
            >
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class MyCertificatesComponent implements AfterViewInit {
  @ViewChild('sentinel') sentinel!: ElementRef;
  private destroyRef = inject(DestroyRef);

  isLoading = signal(false);
  hasMore = signal(true);

  certificates = signal<Certificate[]>([
    {
      id: '1',
      courseTitle: 'Enterprise Spring Boot',
      issueDate: 'JAN 2026',
      organization: 'Amatum Academy',
      verificationId: 'HEX-992-B',
      accentColor: 'bg-emerald-500/10',
    },
    {
      id: '2',
      courseTitle: 'UI/UX Sovereign Systems',
      issueDate: 'FEB 2026',
      organization: 'Lumina Design',
      verificationId: 'HEX-441-A',
      accentColor: 'bg-indigo-500/10',
    },
    {
      id: '3',
      courseTitle: 'Multi-Tenant Security',
      issueDate: 'MAR 2026',
      organization: 'CyberArmor',
      verificationId: 'HEX-102-C',
      accentColor: 'bg-red-500/10',
    },
  ]);

  ngAfterViewInit() {
    this.setupInfiniteScroll();
  }

  private setupInfiniteScroll() {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !this.isLoading() && this.hasMore()) {
          this.loadMore();
        }
      },
      { rootMargin: '100px' },
    );

    observer.observe(this.sentinel.nativeElement);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  private loadMore() {
    this.isLoading.set(true);
    // Mocking Spring Boot latency
    setTimeout(() => {
      this.isLoading.set(false);
      this.hasMore.set(false); // No more data for this demo
    }, 1000);
  }
}

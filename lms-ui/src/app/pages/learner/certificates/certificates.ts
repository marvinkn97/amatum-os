import { CommonModule } from '@angular/common';
import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  inject,
  DestroyRef,
  signal,
  effect,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CertificateService } from '../../../services/certificate.service';
import { CertificateResponse } from '../../../services/certificate.service';
import { TenantService } from '../../../services/tenant.service';
import { NotificationService } from '../../../services/notification.service';
import { Loader } from '../../../components/loader/loader';

@Component({
  selector: 'app-my-certificates',
  standalone: true,
  imports: [CommonModule, Loader],
  template: `
    <div class="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 p-4 lg:p-8 pb-20 px-6">
      <header
        class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10"
      >
        <div class="space-y-1">
          <h1 class="text-md font-black text-white italic tracking-tighter uppercase">
            Certifications
          </h1>
          <p class="text-slate-500 text-sm font-medium">Professional milestones achieved.</p>
        </div>
      </header>

      <!-- Reduced max-width on the grid container to prevent empty space -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 max-w-5xl">
        @for (cert of certificates(); track cert.serialNumber; let i = $index) {
          <div
            class="group bg-white/2 border border-white/5 rounded-4xl p-5 md:p-6 backdrop-blur-md hover:border-indigo-500/40 transition-all duration-500 flex flex-col md:flex-row gap-5 md:gap-6 items-center md:items-start"
          >
            <!-- Reduced container size (size-16) and SVG size (size-6) -->
            <div
              [class]="
                'size-16 md:size-20 shrink-0 rounded-2xl flex items-center justify-center border border-white/10 relative overflow-hidden ' +
                getAccentColor(i)
              "
            >
              <div class="absolute inset-0 bg-linear-to-br from-white/10 to-transparent"></div>
              <svg
                class="size-6 md:size-7 text-white/40 group-hover:text-white transition-colors relative z-10"
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
              <div class="mb-1">
                <span class="text-[10px] font-mono text-slate-600 tracking-tighter">
                  #{{ cert.serialNumber }}
                </span>
              </div>

              <h3
                class="text-md font-black text-white italic tracking-tighter leading-tight group-hover:text-indigo-400 transition-colors"
              >
                {{ cert.title }}
              </h3>

              <p class="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-widest italic">
                Issued: {{ cert.issuedAt | date: 'MMM dd, yyyy' }}
              </p>

              <div class="mt-4">
                <a
                  [href]="cert.certificateUrl"
                  target="_blank"
                  class="text-[9px] font-black uppercase text-white hover:text-indigo-400 transition-all tracking-widest flex items-center gap-2 group/btn no-underline"
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
                  Download Certificate
                </a>
              </div>
            </div>
          </div>
        } @empty {
          @if (!isLoading()) {
            <div
              class="col-span-full py-32 border border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center text-center"
            >
              <span class="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]"
                >No Certificates Available</span
              >
            </div>
          }
        }
      </div>

      <div #sentinel class="w-full py-10 flex justify-center items-center">
        @if (isLoading()) {
          <app-loader />
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

  private certificateService = inject(CertificateService);
  private destroyRef = inject(DestroyRef);
  private tenantService = inject(TenantService);
  private notificationService = inject(NotificationService);

  certificates = signal<CertificateResponse[]>([]);
  totalRecords = signal(0);
  isLoading = signal(false);
  currentPage = signal(0);
  hasMore = signal(true);

  constructor() {
    effect(() => {
      this.tenantService.tenantId();
      untracked(() => this.resetAndReload());
    });
  }

  private resetAndReload() {
    this.certificates.set([]);
    this.currentPage.set(0);
    this.hasMore.set(true);
    this.fetchCertificates();
  }

  ngAfterViewInit() {
    this.setupInfiniteScroll();
  }

  getAccentColor(index: number): string {
    const colors = ['bg-emerald-500/10', 'bg-indigo-500/10', 'bg-rose-500/10', 'bg-amber-500/10'];
    return colors[index % colors.length];
  }

  private setupInfiniteScroll() {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !this.isLoading() && this.hasMore()) {
          this.fetchCertificates();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(this.sentinel.nativeElement);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  private fetchCertificates() {
    this.isLoading.set(true);

    this.certificateService
      .getLearnerCertificates(this.currentPage(), 10)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const newCerts = response._embedded?.certificateResponseList || [];
          this.certificates.update((current) => [...current, ...newCerts]);
          this.totalRecords.set(response.page.totalElements);

          this.hasMore.set(this.currentPage() < response.page.totalPages - 1);
          this.currentPage.update((p) => p + 1);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.notificationService.error('Failed to load certificates. Please try again later.');
        },
      });
  }
}

import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IdentityService } from '../../../services/identity.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  host: { class: 'dark block' },
  template: `
    <div
      class="min-h-screen bg-[#030712] text-slate-100 font-sans antialiased flex items-center justify-center relative overflow-hidden px-6"
    >
      <div class="absolute size-150 bg-indigo-600/10 blur-[120px] rounded-full"></div>

      <div class="relative z-10 max-w-5xl w-full text-center">
        <p class="text-slate-400 text-lg mb-16 max-w-xl mx-auto">
          Choose how you want to use the platform.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button
            (click)="selectRole('learner')"
            [disabled]="loading"
            class="group p-10 rounded-4xl bg-linear-to-b from-white/5 to-transparent border border-white/5 text-left transition-all hover:border-indigo-500/40 hover:scale-[1.02] cursor-pointer disabled:opacity-50 disabled:cursor-wait"
          >
            <div
              class="size-14 rounded-xl bg-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30"
            >
              @if (loading && currentRole === 'learner') {
                <svg class="animate-spin size-7 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              } @else {
                <svg class="size-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 3L2 8l10 5 10-5-10-5z" />
                  <path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M6 10v4c0 2 3 3 6 3s6-1 6-3v-4" />
                </svg>
              }
            </div>

            <h2 class="text-3xl font-bold mb-3 text-white">
              {{ loading && currentRole === 'learner' ? 'Setting up...' : "I'm here to learn" }}
            </h2>

            <p class="text-slate-400 leading-relaxed">
              Access the global marketplace, track your progress, and earn verified certifications.
            </p>

            <div class="mt-8 flex items-center text-sm font-semibold text-indigo-400">
              {{ loading && currentRole === 'learner' ? 'Please wait' : 'Start learning →' }}
            </div>
          </button>

          <button
            (click)="selectRole('manager')"
            [disabled]="loading"
            class="group p-10 rounded-4xl bg-linear-to-b from-indigo-500/10 to-transparent border border-indigo-500/10 text-left transition-all hover:border-indigo-500/40 hover:scale-[1.02] cursor-pointer disabled:opacity-50"
          >
            <div
              class="size-14 rounded-xl bg-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30"
            >
              @if (loading && currentRole === 'manager' && !showOrgDialog) {
                <svg class="animate-spin size-7 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              } @else {
                <svg class="size-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14" />
                  <path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M9 9h1M9 13h1M9 17h1M14 9h1M14 13h1M14 17h1" />
                </svg>
              }
            </div>

            <h2 class="text-3xl font-bold mb-3 text-white">
              {{ loading && currentRole === 'manager' && !showOrgDialog ? 'Opening...' : "I'm here to build" }}
            </h2>

            <p class="text-slate-400 leading-relaxed">
              Launch a private academy for your organization. Create and manage secure internal training.
            </p>

            <div class="mt-8 flex items-center text-sm font-semibold text-indigo-400">
               {{ loading && currentRole === 'manager' && !showOrgDialog ? 'Please wait' : 'Create workspace →' }}
            </div>
          </button>
        </div>
      </div>
    </div>

    @if (showOrgDialog) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fadeIn_200ms_ease]"
      >
        <div
          class="w-full max-w-lg bg-linear-to-b from-[#111823]/80 to-[#0b1120]/80 border border-indigo-500/20 rounded-3xl p-8 shadow-2xl shadow-indigo-500/40 relative overflow-hidden"
        >
          <div class="absolute -top-16 -right-16 w-40 h-40 bg-indigo-600/30 rounded-full blur-3xl animate-pulse"></div>

          <h2 class="text-2xl font-bold mb-6 text-white drop-shadow-md">
            Create your organization
          </h2>

          <div class="space-y-5">
            <div>
              <label class="text-sm text-slate-400 font-medium ml-1">Organization Name</label>
              <input
                [(ngModel)]="organization.name"
                (input)="updateSlug()"
                class="w-full mt-1 bg-black/30 border border-indigo-500/20 rounded-xl px-4 py-3 text-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all duration-300"
                placeholder="Acme Inc"
              />
            </div>

            <div>
              <label class="text-sm text-slate-400 font-medium ml-1">Workspace URL</label>
              <input
                [(ngModel)]="organization.slug"
                (input)="slugEdited = true"
                class="w-full mt-1 bg-black/30 border border-indigo-500/20 rounded-xl px-4 py-3 text-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all duration-300 font-mono text-sm"
              />
              <p class="text-[10px] uppercase tracking-widest text-slate-500 mt-2 ml-1">
                amatum.com/{{ organization.slug || 'your-url' }}
              </p>
            </div>

            <div>
              <label class="text-sm text-slate-400 font-medium ml-1">Organization Domain</label>
              <input
                [(ngModel)]="organization.domain"
                class="w-full mt-1 bg-black/30 border border-indigo-500/20 rounded-xl px-4 py-3 text-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all duration-300"
                placeholder="acme.com"
              />
            </div>
          </div>

          <div class="flex justify-end gap-4 mt-8">
            <button
              (click)="closeDialog()"
              [disabled]="loading"
              class="px-5 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              (click)="submitOrganization()"
              [disabled]="loading || !organization.name"
              class="px-6 py-2 bg-indigo-600 rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-500/50 transition-all duration-300 hover:scale-[1.03] disabled:opacity-50 flex items-center gap-2"
            >
              @if (loading) {
                <svg class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Provisioning...</span>
              } @else {
                <span>Create Workspace</span>
              }
            </button>
          </div>
        </div>
      </div>
    }

    @if (errorMessage()) {
      <div class="fixed top-8 left-1/2 -translate-x-1/2 z-100 flex justify-center w-full px-6">
        <div
          class="flex items-center gap-3 px-5 py-3 bg-[#111823]/95 border border-red-500/30 rounded-full backdrop-blur-md shadow-2xl animate-bounce-in"
        >
          <div class="size-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
          <span class="text-sm font-medium text-red-100">{{ errorMessage() }}</span>
          <button (click)="errorMessage.set(null)" class="ml-2 text-slate-500 hover:text-white">
            <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    }
  `,
})
export class Onboarding {
  router = inject(Router);
  identityService = inject(IdentityService);

  loading = false;
  currentRole: 'learner' | 'manager' | null = null;
  showOrgDialog = false;
  slugEdited = false;

  organization = {
    name: '',
    slug: '',
    domain: '',
  };

  errorMessage = signal<string | null>(null);

  selectRole(role: 'learner' | 'manager') {
    this.currentRole = role;
    if (role === 'learner') {
      this.onboardLearner();
    } else {
      this.showOrgDialog = true;
    }
  }

  onboardLearner() {
    this.loading = true;
    this.identityService.onboardLearner().subscribe({
      next: () => {
        // Redir through callback to force Keycloak updateToken(-1)
        window.location.href = '/auth/callback?target=/learner';
      },
      error: (err) => {
        this.loading = false;
        this.currentRole = null;
        this.showError(err.error?.detail || 'Identity sync failed. Please try again.');
      },
    });
  }

  submitOrganization() {
    this.loading = true;
    this.identityService.onboardManager(this.organization).subscribe({
      next: () => {
        // Redir through callback to capture the new MANAGER role in token
        window.location.href = '/auth/callback?target=/manager';
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.detail || 'The workspace URL or name is already taken.';
        this.showError(msg);
      },
    });
  }

  updateSlug() {
    if (this.slugEdited) return;
    this.organization.slug = this.organization.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '');
  }

  closeDialog() {
    this.showOrgDialog = false;
    this.currentRole = null;
    this.loading = false;
  }

  private showError(message: string) {
    this.errorMessage.set(message);
    setTimeout(() => this.errorMessage.set(null), 6000);
  }
}
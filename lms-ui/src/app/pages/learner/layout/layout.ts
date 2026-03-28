import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import Keycloak from 'keycloak-js';
import { AiAssistant } from '../ai-assistant/ai-assistant';

interface Organization {
  id: string | null;
  name: string;
}

@Component({
  selector: 'app-learner-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, AiAssistant],
  providers: [TitleCasePipe],
  template: `
    <div class="h-screen w-full bg-[#030712] text-slate-100 flex flex-col lg:flex-row overflow-hidden">
      
      <header class="lg:hidden h-16 border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl flex items-center justify-between px-4 z-60 shrink-0">
        <div class="flex items-center gap-3">
          <div class="size-8 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-white text-xs">A</div>
          <span class="font-black tracking-tighter uppercase text-xs">Amatum</span>
        </div>
        <button (click)="isMobileMenuOpen.set(!isMobileMenuOpen())" class="p-2 text-slate-400">
          <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            @if (!isMobileMenuOpen()) { <path stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" /> } 
            @else { <path stroke-width="2" d="M6 18L18 6M6 6l12 12" /> }
          </svg>
        </button>
      </header>

      <aside
        [class.translate-x-0]="isMobileMenuOpen()"
        [class.-translate-x-full]="!isMobileMenuOpen()"
        class="fixed inset-y-0 left-0 w-72 border-r border-white/10 bg-[#030712] flex flex-col z-70 transition-transform duration-300 lg:relative lg:translate-x-0 lg:w-64 lg:bg-[#030712]/50 lg:backdrop-blur-2xl"
      >
        <div class="h-16 hidden lg:flex items-center px-6 border-b border-white/5 shrink-0">
          <div class="size-8 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20 text-xs">A</div>
          <span class="ml-3 font-black tracking-tighter uppercase text-sm">Amatum Lumina</span>
        </div>

        <nav class="flex-1 p-4 space-y-2 overflow-y-auto mt-4 lg:mt-0">
          @for (item of menuItems; track item.path) {
            <a
              [routerLink]="item.path"
              (click)="isMobileMenuOpen.set(false)"
              routerLinkActive="bg-indigo-600/10 text-indigo-400 border-indigo-500/50"
              [routerLinkActiveOptions]="{ exact: true }"
              class="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 border border-transparent hover:bg-white/5 transition-all group"
            >
              <svg class="size-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" [attr.d]="item.icon" />
              </svg>
              <span class="text-sm font-bold">{{ item.label }}</span>
            </a>
          }
        </nav>

        <div class="p-6 border-t border-white/5">
          <div class="flex items-center gap-2 px-2">
            <div class="size-1.5 rounded-full bg-indigo-500/40"></div>
            <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate">
              {{ activeOrg().name }}
            </span>
          </div>
        </div>
      </aside>

      <div class="flex-1 flex flex-col min-w-0 h-full relative">
        <header class="h-16 border-b border-white/5 bg-[#030712]/50 backdrop-blur-xl flex items-center justify-between px-4 lg:px-8 shrink-0 z-40">
          <div class="relative">
            <button (click)="isOrgDropdownOpen.set(!isOrgDropdownOpen())" class="flex items-center gap-3 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 hover:border-indigo-500/50 transition-all cursor-pointer">
              <div class="size-5 rounded bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white uppercase">
                {{ activeOrg().name.substring(0, 1) }}
              </div>
              <span class="text-[10px] lg:text-xs font-bold text-slate-300">{{ activeOrg().name }}</span>
              <svg class="size-3 text-slate-500 transition-transform" [class.rotate-180]="isOrgDropdownOpen()" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </button>

            @if (isOrgDropdownOpen()) {
              <div (click)="isOrgDropdownOpen.set(false)" class="fixed inset-0 z-10"></div>
              <div class="absolute left-0 mt-2 w-64 bg-[#0b1120]/95 border border-white/10 rounded-2xl p-2 shadow-2xl z-20 backdrop-blur-2xl animate-in fade-in slide-in-from-top-1 duration-200">
                @for (org of availableOrgs(); track org.id) {
                  <button (click)="switchWorkspace(org)" [ngClass]="{ 'bg-white/10 text-indigo-400': isWorkspaceActive(org.id) }" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-white/5 group text-left cursor-pointer">
                    <div class="size-6 shrink-0 rounded border border-white/10 flex items-center justify-center text-[10px] uppercase">
                      {{ org.name.substring(0, 1) }}
                    </div>
                    <span class="text-xs font-bold">{{ org.name }}</span>
                  </button>
                }
              </div>
            }
          </div>

          <div class="flex items-center gap-3 lg:gap-5">
            <button (click)="isAiOpen.set(true)" class="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/10 text-slate-400 cursor-pointer">
              <svg class="size-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <span class="text-xs font-bold hidden sm:block">AMAI</span>
            </button>

            <div class="h-6 w-px bg-white/10 mx-1"></div>

            <div class="relative">
              <button (click)="isProfileOpen.set(!isProfileOpen())" class="flex items-center gap-3 p-1 rounded-full hover:bg-white/5 transition-all cursor-pointer group">
                <div class="size-8 rounded-full bg-linear-to-tr from-indigo-600 to-purple-600 border border-white/20 flex items-center justify-center text-xs font-black text-white uppercase">
                  {{ fullName().substring(0, 1) }}
                </div>
                <div class="hidden lg:block text-left">
                  <p class="text-xs font-bold text-white leading-none mb-0.5">{{ fullName() }}</p>
                  <p class="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">Learner</p>
                </div>
              </button>

              @if (isProfileOpen()) {
                <div (click)="isProfileOpen.set(false)" class="fixed inset-0 z-10"></div>
                <div class="absolute right-0 mt-2 w-56 bg-[#0b1120] border border-white/10 rounded-2xl p-2 shadow-2xl z-20 backdrop-blur-xl animate-in fade-in zoom-in duration-200">
                  <div class="px-3 py-3 mb-1 border-b border-white/5">
                    <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Account</p>
                    <p class="text-xs font-bold text-white truncate leading-none mb-1">{{ fullName() }}</p>
                    <p class="text-[10px] text-slate-400 truncate">{{ email() }}</p>
                  </div>
                  
                  <button routerLink="/learner/profile" (click)="isProfileOpen.set(false)" class="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all mb-1 cursor-pointer">
                    <svg class="size-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Profile
                  </button>

                  @if (isSuperAdmin()) {
                    <button 
                      routerLink="/super-admin" 
                      (click)="isProfileOpen.set(false)" 
                      class="w-full flex items-center gap-3 px-3 py-2 text-sm text-amber-500/80 hover:bg-amber-500/10 rounded-xl transition-all mb-1 cursor-pointer"
                    >
                      <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Switch to Console
                    </button>
                  }

                  <button (click)="isLogoutConfirmOpen.set(true); isProfileOpen.set(false)" class="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer">
                    <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-width="2" d="M17 16l4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              }
            </div>
          </div>
        </header>

        <main class="flex-1 overflow-y-auto p-4 lg:p-8 relative">
          <router-outlet />
        </main>
      </div>

      @if (isLogoutConfirmOpen()) {
        <div class="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div (click)="isLogoutConfirmOpen.set(false)" class="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"></div>
          <div class="relative w-full max-w-sm bg-[#0b1120] border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in slide-in-from-bottom-4 duration-300">
            <div class="size-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-red-500/20">
              <svg class="size-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white text-center mb-2">Confirm Sign Out</h3>
            <p class="text-sm text-slate-400 text-center mb-8 leading-relaxed">Are you sure? You'll need to log back in to access your courses and progress.</p>
            <div class="flex flex-col gap-3">
              <button (click)="logout()" class="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20 cursor-pointer">Yes, Sign Out</button>
              <button (click)="isLogoutConfirmOpen.set(false)" class="w-full py-3.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl text-sm font-bold transition-all border border-white/10 cursor-pointer">Stay Logged In</button>
            </div>
          </div>
        </div>
      }

      @if (isAiOpen()) { <app-ai-assistant [(isOpen)]="isAiOpen" /> }
    </div>
  `,
})
export class LearnerLayout {
  private keycloak = inject(Keycloak);

  isAiOpen = signal(false);
  isProfileOpen = signal(false);
  isOrgDropdownOpen = signal(false);
  isMobileMenuOpen = signal(false);
  isLogoutConfirmOpen = signal(false);

  fullName = signal(this.keycloak.tokenParsed?.['name'] || 'User');
  email = signal(this.keycloak.tokenParsed?.['email'] || '');
  isSuperAdmin = signal(this.keycloak.hasRealmRole('SUPER_ADMIN'));

  availableOrgs = computed<Organization[]>(() => {
    const personal: Organization = { id: null, name: 'Personal Workspace' };
    const orgClaim = this.keycloak.tokenParsed?.['organization'];
    if (!orgClaim) return [personal];
    return [personal, ...Object.entries(orgClaim).map(([key, value]: [string, any]) => ({ id: value.id, name: key }))];
  });

  activeOrg = signal<Organization>({ id: null, name: 'Personal Workspace' });

  constructor() {
    const orgs = this.availableOrgs();
    if (orgs.length > 0) this.activeOrg.set(orgs[0]);
  }

  switchWorkspace(org: Organization) {
    this.activeOrg.set(org);
    this.isOrgDropdownOpen.set(false);
  }

  menuItems = [
    { label: 'Dashboard', path: '/learner/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { label: 'Courses', path: '/learner/course-catalogue', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { label: 'Certifications', path: '/learner/certificates', icon: 'M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z' },
  ];

  logout() {
    this.keycloak.logout({ redirectUri: window.location.origin });
  }

  isWorkspaceActive(orgId: string | null): boolean {
    return this.activeOrg().id === orgId;
  }
}
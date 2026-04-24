import { Component, inject, signal } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import Keycloak from 'keycloak-js';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  providers: [TitleCasePipe],
  template: `
    <div class="h-screen w-full bg-[#030712] text-slate-100 flex flex-col lg:flex-row overflow-hidden">
      
      <header class="lg:hidden h-16 border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl flex items-center justify-between px-4 z-60 shrink-0">
        <div class="flex items-center gap-3">
          <div class="size-8 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-white text-xs">A</div>
          <span class="font-black tracking-tighter uppercase text-xs">Amatum Lumina</span>
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
          <span class="ml-3 font-black tracking-tighter uppercase text-sm italic">Amatum Lumina</span>
        </div>

        <nav class="flex-1 p-4 space-y-1 overflow-y-auto mt-4 lg:mt-0">
          <p class="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Management</p>
          
          @for (item of managementItems; track item.path) {
            <a
              [routerLink]="item.path"
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

          <div class="pt-4 mt-4 border-t border-white/5">
            <button 
              (click)="isConfigOpen.set(!isConfigOpen())"
              class="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group"
              [class.text-indigo-400]="isConfigOpen()"
              [class.text-slate-500]="!isConfigOpen()"
            >
              <div class="flex items-center gap-4">
                <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
                <span class="text-sm font-bold">Configuration</span>
              </div>
              <svg 
                class="size-4 transition-transform duration-300" 
                [class.rotate-180]="isConfigOpen()" 
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            @if (isConfigOpen()) {
              <div class="mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
                <a
                  routerLink="/super-admin/config/categories"
                  routerLinkActive="bg-white/5 text-white"
                  class="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
                >
                  <svg class="size-4 opacity-70 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span class="text-xs font-bold">Categories</span>
                </a>
              </div>
            }
          </div>
        </nav>

        <div class="p-6 mt-auto border-t border-white/5 opacity-30">
           <div class="flex items-center gap-2 px-2">
             <div class="size-1.5 rounded-full bg-slate-500"></div>
             <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">System Admin Console</span>
           </div>
        </div>
      </aside>

      <div class="flex-1 flex flex-col min-w-0 h-full relative">
        <header class="h-16 border-b border-white/5 bg-[#030712]/50 backdrop-blur-xl flex items-center justify-end px-4 lg:px-8 shrink-0 z-40">
          <div class="relative">
            <button (click)="isProfileOpen.set(!isProfileOpen())" class="flex items-center gap-3 p-1 rounded-full hover:bg-white/5 transition-all cursor-pointer group">
              <div class="size-8 rounded-full bg-linear-to-tr from-indigo-600 to-indigo-400 border border-white/20 flex items-center justify-center text-xs font-black text-white uppercase">
                {{ fullName().substring(0, 1) }}
              </div>
              <div class="hidden lg:block text-left px-1">
                <p class="text-xs font-bold text-white leading-none mb-0.5">{{ fullName() }}</p>
                <p class="text-[10px] text-indigo-400 font-black uppercase tracking-tighter">System Administrator</p>
              </div>
              <svg
                  class="size-3 text-slate-500 group-hover:text-white transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M19 9l-7 7-7-7" stroke-width="2" />
                </svg>
            </button>
            
            @if (isProfileOpen()) {
              <div (click)="isProfileOpen.set(false)" class="fixed inset-0 z-10"></div>
              <div class="absolute right-0 mt-2 w-60 bg-[#0b1120] border border-white/10 rounded-2xl p-2 shadow-2xl z-20 animate-in fade-in zoom-in duration-200">
                <div class="px-3 py-3 mb-1 border-b border-white/5">
                  <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Authenticated As</p>
                  <p class="text-xs font-bold text-white truncate leading-none">{{ email() }}</p>
                </div>

                <div class="py-1">
                  <p class="px-3 py-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">Switch View</p>
                  @if (canSwitchToManager()) {
                    <button routerLink="/manager" (click)="isProfileOpen.set(false)" class="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer">
                      <svg class="size-4 text-emerald-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      Manager Portal
                    </button>
                  }
                  @if (canSwitchToLearner()) {
                    <button routerLink="/learner" (click)="isProfileOpen.set(false)" class="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer">
                      <svg class="size-4 text-sky-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" /></svg>
                      Learner Portal
                    </button>
                  }
                </div>

                <div class="h-px bg-white/5 my-1"></div>

                <button (click)="isLogoutConfirmOpen.set(true); isProfileOpen.set(false)" class="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer">
                  <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M17 16l4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                  Sign Out
                </button>
              </div>
            }
          </div>
        </header>

        <main class="flex-1 overflow-y-auto relative">
          <router-outlet />
        </main>

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
              <p class="text-sm text-slate-400 text-center mb-8 leading-relaxed">Are you sure? You'll need to log back in to access the sovereign console.</p>
              <div class="flex flex-col gap-3">
                <button (click)="logout()" class="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20 cursor-pointer">Yes, Sign Out</button>
                <button (click)="isLogoutConfirmOpen.set(false)" class="w-full py-3.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl text-sm font-bold transition-all border border-white/10 cursor-pointer">Stay Authenticated</button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class SuperAdminLayout {
  private keycloak = inject(Keycloak);

  isProfileOpen = signal(false);
  isMobileMenuOpen = signal(false);
  isLogoutConfirmOpen = signal(false);
  isConfigOpen = signal(false);

  fullName = signal(this.keycloak.tokenParsed?.['name'] || 'Admin');
  email = signal(this.keycloak.tokenParsed?.['email'] || '');

  canSwitchToManager = signal(this.keycloak.hasResourceRole('MANAGER', this.keycloak.clientId));
  canSwitchToLearner = signal(this.keycloak.hasResourceRole('LEARNER', this.keycloak.clientId));

  managementItems = [
    { label: 'Dashboard', path: '/super-admin/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  ];

  // logout() {
  //   this.keycloak.logout({ redirectUri: window.location.origin });
  // }

  async logout() {
  // 1. Get the ID Token from Keycloak
  const idToken = this.keycloak.idToken;

  // 2. Build the logout URL manually
  const baseUrl = environment.keycloak.url;
  const realm = environment.keycloak.realm;
  const clientId = environment.keycloak.clientId;
  const postLogoutUri = encodeURIComponent(window.location.origin);

  // If we have an ID token, Keycloak skips the "Confirm Logout" screen
  const logoutUrl = `${baseUrl}/realms/${realm}/protocol/openid-connect/logout?` + 
                    `id_token_hint=${idToken}&` +
                    `post_logout_redirect_uri=${postLogoutUri}`;

  // 3. Perform the redirect
  window.location.href = logoutUrl;
}
}
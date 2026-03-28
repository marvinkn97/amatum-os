import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import Keycloak from 'keycloak-js';
import { ACTIVE_TENANT_ID } from '../../../auth/tenant-context.token';
import { TenantService } from '../../../services/tenant.service';

interface Organization {
  id: string | null;
  name: string;
}

@Component({
  selector: 'app-manager-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  providers: [TitleCasePipe],
  template: `
    <div
      class="h-screen w-full bg-[#030712] text-slate-100 flex flex-col lg:flex-row overflow-hidden"
    >
      <header
        class="lg:hidden h-16 border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl flex items-center justify-between px-4 z-60 shrink-0"
      >
        <div class="flex items-center gap-3">
          <div
            class="size-8 bg-purple-600 rounded-lg flex items-center justify-center font-black text-white text-xs"
          >
            A
          </div>
          <span class="font-black tracking-tighter uppercase text-xs">Amatum Lumina</span>
        </div>
        <button (click)="isMobileMenuOpen.set(!isMobileMenuOpen())" class="p-2 text-slate-400">
          <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            @if (!isMobileMenuOpen()) {
              <path stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
            } @else {
              <path stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            }
          </svg>
        </button>
      </header>

      <aside
        [class.translate-x-0]="isMobileMenuOpen()"
        [class.-translate-x-full]="!isMobileMenuOpen()"
        class="fixed inset-y-0 left-0 w-72 border-r border-white/10 bg-[#030712] flex flex-col z-70 transition-transform duration-300 lg:relative lg:translate-x-0 lg:w-64 lg:bg-[#030712]/50 lg:backdrop-blur-2xl"
      >
        <div class="h-16 hidden lg:flex items-center px-6 border-b border-white/5 shrink-0">
          <div
            class="size-8 bg-purple-600 rounded-lg flex items-center justify-center font-black text-white shadow-lg shadow-purple-500/20 text-xs"
          >
            A
          </div>
          <span class="ml-3 font-black tracking-tighter uppercase text-sm text-white"
            >Amatum Lumina</span
          >
        </div>

        <nav class="flex-1 p-4 space-y-2 overflow-y-auto mt-4 lg:mt-0">
          <p class="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">
            Management
          </p>
          @for (item of menuItems; track item.path) {
            <a
              [routerLink]="item.path"
              (click)="isMobileMenuOpen.set(false)"
              routerLinkActive="bg-purple-600/10 text-purple-400 border-purple-500/50"
              [routerLinkActiveOptions]="{ exact: true }"
              class="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 border border-transparent hover:bg-white/5 transition-all group"
            >
              <svg
                class="size-5 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  [attr.d]="item.icon"
                />
              </svg>
              <span class="text-sm font-bold">{{ item.label }}</span>
            </a>
          }
        </nav>

        <div
          class="p-4 mt-auto border-t border-white/5 bg-linear-to-b from-transparent to-purple-950/20"
        >
          <div
            class="relative group bg-white/2 border border-white/10 rounded-2xl p-5 overflow-hidden transition-all hover:border-purple-500/30"
          >
            <div class="relative z-10">
              <span
                class="text-[10px] font-black text-purple-400 uppercase tracking-widest bg-purple-400/10 px-2 py-0.5 rounded"
                >Academy Plan</span
              >
              <p class="text-xs font-bold text-white mt-3 mb-1 leading-tight">Scale Your Team</p>
              <p class="text-[10px] text-slate-500 font-medium mb-4">
                You have 12 active licenses remaining.
              </p>
              <button
                class="w-full py-2.5 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all cursor-pointer"
              >
                Manage Billing
              </button>
            </div>
          </div>
        </div>
      </aside>

      @if (isMobileMenuOpen()) {
        <div
          (click)="isMobileMenuOpen.set(false)"
          class="fixed inset-0 bg-black/60 backdrop-blur-sm z-65 lg:hidden animate-in fade-in duration-300"
        ></div>
      }

      <div class="flex-1 flex flex-col min-w-0 h-full relative">
        <header
          class="h-16 border-b border-white/5 bg-[#030712]/50 backdrop-blur-xl flex items-center justify-between px-4 lg:px-8 shrink-0 z-40"
        >
          <div class="relative">
            <button
              (click)="isOrgDropdownOpen.set(!isOrgDropdownOpen())"
              class="flex items-center gap-2 lg:gap-3 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer"
            >
              <div
                class="size-5 rounded bg-purple-600 flex items-center justify-center text-[10px] font-black text-white uppercase"
              >
                {{ activeOrg().name.substring(0, 1) }}
              </div>
              <span
                class="text-[10px] lg:text-xs font-bold text-slate-300 truncate max-w-20 lg:max-w-none"
                >{{ activeOrg().name }}</span
              >
              <svg
                class="size-3 text-slate-500 transition-transform"
                [class.rotate-180]="isOrgDropdownOpen()"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            @if (isOrgDropdownOpen()) {
              <div (click)="isOrgDropdownOpen.set(false)" class="fixed inset-0 z-10"></div>
              <div
                class="absolute left-0 mt-2 w-64 bg-[#0b1120]/95 border border-white/10 rounded-2xl p-2 shadow-2xl z-20 backdrop-blur-2xl animate-in fade-in slide-in-from-top-1 duration-200"
              >
                @for (org of availableOrgs(); track org.id) {
                  <button
                    (click)="switchWorkspace(org)"
                    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-white/5 group text-left cursor-pointer"
                  >
                    <div
                      class="size-6 shrink-0 rounded bg-purple-600/20 text-purple-400 border border-white/10 flex items-center justify-center text-[10px] font-bold uppercase"
                    >
                      {{ org.name.substring(0, 1) }}
                    </div>
                    <span
                      class="text-xs font-bold text-slate-300 transition-colors"
                      [class.text-purple-400]="activeOrg().id === org.id"
                      >{{ org.name }}</span
                    >
                    @if (activeOrg().id === org.id) {
                      <div
                        class="ml-auto size-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]"
                      ></div>
                    }
                  </button>
                }
                <div class="border-t border-white/5 mt-2 pt-2">
                  <button
                    routerLink="/onboarding"
                    class="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-white transition-all"
                  >
                    <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Request Access
                  </button>
                </div>
              </div>
            }
          </div>

          <div class="flex items-center gap-3 lg:gap-5">
            <div class="relative">
              <button
                (click)="isProfileOpen.set(!isProfileOpen())"
                class="flex items-center gap-3 p-1 rounded-full hover:bg-white/5 transition-all cursor-pointer group"
              >
                <div
                  class="size-8 rounded-full bg-linear-to-tr from-purple-600 to-indigo-600 border border-white/20 shadow-lg shadow-purple-500/10 flex items-center justify-center text-xs font-black text-white uppercase"
                >
                  {{ fullName().substring(0, 1) }}
                </div>
                <div class="hidden lg:block text-left">
                  <p class="text-xs font-bold text-white leading-none mb-0.5">{{ fullName() }}</p>
                  <p class="text-[10px] text-purple-400 font-bold uppercase tracking-tighter">
                    Manager
                  </p>
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
                <div
                  class="absolute right-0 mt-2 w-56 bg-[#0b1120] border border-white/10 rounded-2xl p-2 shadow-2xl z-20 backdrop-blur-xl animate-in fade-in zoom-in duration-200"
                >
                  <div class="px-3 py-3 mb-1 border-b border-white/5">
                    <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                      Account
                    </p>
                    <p class="text-xs font-bold text-white truncate leading-none mb-1">
                      {{ fullName() }}
                    </p>
                    <p class="text-[10px] text-slate-400 truncate">{{ email() }}</p>
                  </div>

                  <button
                    routerLink="/manager/profile"
                    (click)="isProfileOpen.set(false)"
                    class="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all mb-1 cursor-pointer"
                  >
                    <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Profile
                  </button>

                  <button
                    (click)="isLogoutConfirmOpen.set(true); isProfileOpen.set(false)"
                    class="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                  >
                    <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-width="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Sign Out
                  </button>
                </div>
              }
            </div>
          </div>
        </header>

        <main class="flex-1 flex flex-col overflow-hidden p-4 lg:p-8 relative">
          <router-outlet />
          <div
            class="fixed top-0 right-0 size-125 bg-purple-600/5 blur-[120px] -z-10 rounded-full pointer-events-none"
          ></div>
        </main>
      </div>

      @if (isLogoutConfirmOpen()) {
        <div class="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div
            (click)="isLogoutConfirmOpen.set(false)"
            class="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
          ></div>
          <div
            class="relative w-full max-w-sm bg-[#0b1120] border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in slide-in-from-bottom-4 duration-300"
          >
            <div
              class="size-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-red-500/20"
            >
              <svg
                class="size-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white text-center mb-2">Confirm Sign Out</h3>
            <p class="text-sm text-slate-400 text-center mb-8 leading-relaxed">
              Are you sure? You'll need to log back in to manage your academy.
            </p>
            <div class="flex flex-col gap-3">
              <button
                (click)="logout()"
                class="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20"
              >
                Yes, Sign Out
              </button>
              <button
                (click)="isLogoutConfirmOpen.set(false)"
                class="w-full py-3.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl text-sm font-bold transition-all border border-white/10"
              >
                Stay Logged In
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ManagerLayout {
  private keycloak = inject(Keycloak);

  private tenantService = inject(TenantService);

  constructor() {
    const orgClaim = this.keycloak.tokenParsed?.['organization'];
    if (orgClaim) {
      const firstOrg = Object.values(orgClaim)[0] as any;

      // Update the signal in the service
      this.tenantService.setTenantId(firstOrg.id);
      this.activeOrg.set({ id: firstOrg.id, name: Object.keys(orgClaim)[0] });
      console.log('✅ Global Tenant ID initialized in Service:', firstOrg.id);
    }
  }

  // UI State
  isProfileOpen = signal(false);
  isOrgDropdownOpen = signal(false);
  isMobileMenuOpen = signal(false);
  isLogoutConfirmOpen = signal(false);

  // User Identity
  fullName = signal(this.keycloak.tokenParsed?.['name'] || 'Manager');
  email = signal(this.keycloak.tokenParsed?.['email'] || '');

  // Org Logic: Map Keycloak orgs and default to the first one
  availableOrgs = computed<Organization[]>(() => {
    const orgClaim = this.keycloak.tokenParsed?.['organization'];
    if (!orgClaim) return [];
    return Object.entries(orgClaim).map(([key, value]: [string, any]) => ({
      id: value.id,
      name: key,
    }));
  });

  // Automatically initialize with the first managed organization
  activeOrg = signal<Organization>(this.availableOrgs()[0] || { id: null, name: 'Loading...' });

  menuItems = [
    {
      label: 'Insights',
      path: '/manager/',
      icon: 'M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0v3.75',
    },
    {
      label: 'Courses',
      path: '/manager/courses',
      icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25V20.25',
    },
    {
      label: 'Members',
      path: '/manager/members',
      icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
    },
  ];

  switchWorkspace(org: Organization) {
    this.activeOrg.set(org);
    this.tenantService.setTenantId(org.id); // Update the global signal
    this.isOrgDropdownOpen.set(false);
  }

  logout() {
    this.keycloak.logout({ redirectUri: window.location.origin });
  }
}

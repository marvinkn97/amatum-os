import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IdentityService } from '../../../services/identity.service';
import Keycloak from 'keycloak-js';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto pb-20 px-4 md:px-6">
      
      <div class="mb-8 md:mb-12">
        <h1 class="text-md font-black text-white tracking-tighter uppercase italic">
          Profile Settings
        </h1>
        <div class="h-1 w-10 bg-indigo-600 mt-3 rounded-full"></div>
      </div>

      @if (errorMessage() && !firstName) {
        <div class="p-6 md:p-10 border border-red-500/20 bg-red-500/5 backdrop-blur-xl rounded-3xl animate-in fade-in slide-in-from-top-4 duration-500">
          <div class="flex flex-col items-center text-center space-y-4">
            <div class="size-12 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 mb-2">
              <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 class="text-xs font-black text-red-400 uppercase tracking-[0.3em]">Connection Failed</h2>
            <p class="text-sm text-slate-400 max-w-xs mx-auto font-medium">We couldn't sync your profile data. Please check your connection and try again.</p>
            <button (click)="loadUserProfile()" class="mt-4 px-8 py-2.5 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-400 transition-all shadow-lg shadow-red-500/20">
              Retry Sync
            </button>
          </div>
        </div>
      }

      @else if (errorMessage()) {
        <div class="mb-8 flex items-center justify-between p-4 border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-md rounded-xl animate-in fade-in slide-in-from-top-4">
          <div class="flex items-center gap-3">
            <div class="size-2 bg-indigo-500 rounded-full animate-pulse"></div>
            <p class="text-[9px] md:text-[10px] font-bold text-indigo-200 uppercase tracking-widest">{{ errorMessage() }}</p>
          </div>
          <button (click)="errorMessage.set(null)" class="text-[10px] text-white/20 hover:text-white transition-colors uppercase font-black">Dismiss</button>
        </div>
      }

      @if (loading()) {
        <div class="space-y-12">
          <div class="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
             <div class="shimmer-sweep"></div>
             <div class="h-4 w-24 bg-white/10 rounded mb-8"></div>
             <div class="grid grid-cols-2 gap-4"><div class="h-10 bg-white/5 rounded-lg"></div><div class="h-10 bg-white/5 rounded-lg"></div></div>
          </div>
        </div>
      }

      @if (!loading() && firstName) {
        <div class="space-y-12 md:space-y-20 animate-in fade-in duration-700">
          
          <section class="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12 items-start">
            <div class="lg:col-span-8 bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm order-2 lg:order-1 relative overflow-hidden">
              @if (isSubmitting()) {
                <div class="absolute top-0 left-0 right-0 h-0.5 bg-indigo-500/20 overflow-hidden"><div class="h-full bg-indigo-500 animate-progress-fast"></div></div>
              }
              <div class="flex justify-between items-center mb-8 gap-2">
                <h2 class="text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] whitespace-nowrap">Identity</h2>
                <div class="flex gap-2">
                  @if (!isEditingNames()) {
                    <button (click)="isEditingNames.set(true)" class="px-3 py-1.5 rounded-lg border border-white/10 text-[8px] sm:text-[10px] font-black text-slate-300 hover:bg-white/5 uppercase tracking-widest transition-all">Edit</button>
                  } @else {
                    <button (click)="cancelNameEdit()" [disabled]="isSubmitting()" class="px-2 py-1.5 text-[8px] sm:text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest disabled:opacity-30">Cancel</button>
                    <button (click)="updateNames()" [disabled]="isSubmitting()" class="px-3 py-1.5 bg-indigo-600 rounded-lg text-[8px] sm:text-[10px] font-black text-white hover:bg-indigo-500 uppercase tracking-widest shadow-lg shadow-indigo-500/20">Save</button>
                  }
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8" [class.opacity-50]="isSubmitting()">
                <div class="space-y-2">
                  <label class="text-[9px] font-bold text-slate-500 tracking-widest ml-1 uppercase">First Name</label>
                  @if (isEditingNames()) {
                    <input [(ngModel)]="firstName" [disabled]="isSubmitting()" class="w-full bg-black/40 border border-indigo-500/30 rounded-xl px-4 py-2.5 text-sm font-bold text-white outline-none focus:border-indigo-500 transition-colors" />
                  } @else {
                    <div class="px-4 py-2.5 bg-white/2 border border-white/5 rounded-xl text-sm font-bold text-slate-200 truncate">{{ firstName }}</div>
                  }
                </div>
                <div class="space-y-2">
                  <label class="text-[9px] font-bold text-slate-500 tracking-widest ml-1 uppercase">Last Name</label>
                  @if (isEditingNames()) {
                    <input [(ngModel)]="lastName" [disabled]="isSubmitting()" class="w-full bg-black/40 border border-indigo-500/30 rounded-xl px-4 py-2.5 text-sm font-bold text-white outline-none focus:border-indigo-500 transition-colors" />
                  } @else {
                    <div class="px-4 py-2.5 bg-white/2 border border-white/5 rounded-xl text-sm font-bold text-slate-200 truncate">{{ lastName }}</div>
                  }
                </div>
              </div>
            </div>
            <div class="lg:col-span-4 order-1 lg:order-2 px-1">
              <h3 class="text-xs font-bold text-white mb-2 tracking-tight">Identity Details</h3>
              <p class="text-[11px] text-slate-500 leading-relaxed font-medium">Modify your recorded name for official documentation purposes.</p>
            </div>
          </section>

          <section class="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12 items-center">
            <div class="lg:col-span-8 bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-row items-center justify-between gap-4 order-2 lg:order-1 min-w-0 transition-all">
              <div class="space-y-1 min-w-0 flex-1">
                <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest block ml-1">Email Address</span>
                <p class="text-sm font-bold text-slate-400 tracking-tight truncate pr-2" [title]="email">{{ email }}</p>
              </div>
              
              @if (isEmailVerified()) {
                <div class="shrink-0 flex items-center gap-2 px-2.5 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div class="size-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <span class="text-[8px] sm:text-[9px] font-black text-green-500 uppercase tracking-wider whitespace-nowrap">Verified</span>
                </div>
              } @else {
                <div class="shrink-0 flex items-center gap-2 px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <div class="size-1.5 rounded-full bg-amber-500"></div>
                  <span class="text-[8px] sm:text-[9px] font-black text-amber-500 uppercase tracking-wider whitespace-nowrap">Unverified</span>
                </div>
              }
            </div>
            <div class="lg:col-span-4 order-1 lg:order-2 px-1">
              <h3 class="text-xs font-bold text-white mb-2 tracking-tight">Communication</h3>
              <p class="text-[11px] text-slate-500 leading-relaxed font-medium">Primary contact for system alerts and security notifications.</p>
            </div>
          </section>

          <section class="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12 items-start">
            <div class="lg:col-span-8 bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm order-2 lg:order-1 relative overflow-hidden">
              <div class="flex justify-between items-center mb-8 gap-2">
                <h2 class="text-[9px] md:text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] whitespace-nowrap">Security</h2>
                @if (!isChangingPassword()) {
                  <button (click)="isChangingPassword.set(true)" class="px-2 sm:px-3 py-1.5 rounded-lg border border-purple-500/20 text-[8px] sm:text-[10px] font-black text-purple-400 uppercase tracking-widest whitespace-nowrap transition-all hover:bg-purple-500/10">Change Password</button>
                }
              </div>
              @if (isChangingPassword()) {
                <div class="space-y-6 animate-in slide-in-from-left-4 duration-300">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="password" [(ngModel)]="newPassword" class="w-full bg-black/40 border border-purple-500/30 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500 transition-colors" placeholder="New Password" />
                    <input type="password" [(ngModel)]="confirmPassword" class="w-full bg-black/40 border border-purple-500/30 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500 transition-colors" placeholder="Confirm" />
                  </div>
                  <div class="flex justify-end gap-4 pt-4 border-t border-white/5">
                    <button (click)="cancelPasswordChange()" class="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Cancel</button>
                    <button (click)="updatePassword()" class="px-4 py-1.5 bg-purple-600 rounded-lg text-[9px] font-black text-white uppercase tracking-widest shadow-lg shadow-purple-500/20 hover:bg-purple-500 transition-all">Update</button>
                  </div>
                </div>
              } @else {
                <div class="px-4 py-2.5 bg-white/2 border border-white/5 rounded-xl text-slate-600 tracking-[0.3em] text-[10px] uppercase">••••••••••••</div>
              }
            </div>
            <div class="lg:col-span-4 order-1 lg:order-2 px-1">
              <h3 class="text-xs font-bold text-white mb-2 tracking-tight">Credentials</h3>
              <p class="text-[11px] text-slate-500 leading-relaxed font-medium">Update your password to keep your account secure.</p>
            </div>
          </section>
        </div>
      }
    </div>
  `,
  styles: [`
    .shimmer-sweep { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.03) 50%, transparent 100%); animation: shimmer-anim 2s infinite; z-index: 10; }
    @keyframes shimmer-anim { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
    .animate-progress-fast { width: 100%; animation: progress-move 1.5s ease-in-out infinite; }
    @keyframes progress-move { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
  `]
})
export class ProfileComponent implements OnInit {
  private readonly identityService = inject(IdentityService);
  private readonly keycloak = inject(Keycloak);

  loading = signal(true);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  
  isEditingNames = signal(false);
  isChangingPassword = signal(false);
  isEmailVerified = signal(false);

  firstName = '';
  lastName = '';
  email = '';
  newPassword = '';
  confirmPassword = '';

  private originalData = { firstName: '', lastName: '' };

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.identityService.getUserProfile()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (user) => {
          this.firstName = user.firstName;
          this.lastName = user.lastName;
          this.email = user.email;
          this.originalData = { firstName: user.firstName, lastName: user.lastName };
          
          // KEYCLOAK CHECK: Access the verified claim from the token
          const verified = this.keycloak.tokenParsed?.['email_verified'];
          this.isEmailVerified.set(!!verified);
        },
        error: () => this.errorMessage.set("Identity Sync Failed")
      });
  }

  updateNames() {
    if (!this.firstName.trim() || !this.lastName.trim()) return;
    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.identityService.updateName({ firstName: this.firstName, lastName: this.lastName })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.originalData = { firstName: this.firstName, lastName: this.lastName };
          this.isEditingNames.set(false);
          this.errorMessage.set("Identity Synced Successfully");
        },
        error: () => this.errorMessage.set('Update Encountered an Error')
      });
  }

  updatePassword() {
    if (!this.newPassword || this.newPassword !== this.confirmPassword) {
      this.errorMessage.set('Passwords do not match');
      return;
    }
    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.identityService.updatePassword({ password: this.newPassword })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.cancelPasswordChange();
          this.errorMessage.set("Security Credentials Updated");
          // Logout to force re-authentication with new password
          this.keycloak.logout();
        },
        error: () => this.errorMessage.set('Password Update Failed')
      });
  }

  cancelNameEdit() {
    this.firstName = this.originalData.firstName;
    this.lastName = this.originalData.lastName;
    this.isEditingNames.set(false);
  }

  cancelPasswordChange() {
    this.isChangingPassword.set(false);
    this.newPassword = '';
    this.confirmPassword = '';
  }
}
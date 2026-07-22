import {
  Component,
  signal,
  effect,
  inject,
  OnInit,
  ElementRef,
  ViewChild,
  untracked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../services/notification.service';
import {
  IdentityResponse,
  IdentityService,
  OrganizationInvitationResponse,
} from '../../../services/identity.service';
import { TenantService } from '../../../services/tenant.service';

@Component({
  selector: 'app-manager-members',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20 px-4 md:px-6 w-full"
    >
      <header
        class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10"
      >
        <div>
          <h1 class="text-md font-black text-white italic tracking-tighter mb-2 uppercase">
            Members
          </h1>
          <p class="text-slate-500 text-sm font-medium">
            Manage your organization's staff and invitations.
          </p>
        </div>
        <button
          (click)="inviteModal.showModal()"
          class="h-10 px-6 bg-white text-black rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white transition-all active:scale-95 font-black uppercase text-[10px] tracking-widest shadow-lg cursor-pointer"
        >
          Invite Member
        </button>
      </header>

      <div class="flex items-center gap-4">
        <div class="flex p-1 bg-white/5 border border-white/10 rounded-xl backdrop-blur-3xl">
          <button
            (click)="viewMode.set('members')"
            [class]="
              viewMode() === 'members' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'
            "
            class="flex items-center gap-2 px-6 py-2 rounded-lg text-[12px] font-black uppercase tracking-widest transition-all cursor-pointer"
          >
            Members
            <span class="bg-black/20 text-[9px] px-1.5 py-0.5 rounded-md">{{ memberCount() }}</span>
          </button>
          <button
            (click)="viewMode.set('invitations')"
            [class]="
              viewMode() === 'invitations'
                ? 'bg-white text-black'
                : 'text-slate-500 hover:text-white'
            "
            class="flex items-center gap-2 px-6 py-2 rounded-lg text-[12px] font-black uppercase tracking-widest transition-all cursor-pointer"
          >
            Invitations
            <span class="bg-black/20 text-[9px] px-1.5 py-0.5 rounded-md">{{ inviteCount() }}</span>
          </button>
        </div>
      </div>

      @if (isLoading()) {
        <div class="max-w-7xl mx-auto px-6 py-20 text-center">
          <div
            class="size-6 border-2 border-white/10 border-t-indigo-500 rounded-full animate-spin mx-auto"
          ></div>
        </div>
      } @else {
        <div
          class="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md overflow-x-auto"
        >
          <table class="w-full text-left border-collapse min-w-150">
            <thead>
              <tr
                class="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] border-b border-white/5 bg-[#030712]/40 sticky top-0 backdrop-blur-md z-10"
              >
                <th class="p-8">Full Name</th>
                <th class="p-8">Email</th>
                <th class="p-8">{{ viewMode() === 'members' ? 'Join Date' : 'Status' }}</th>
                <th class="p-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="text-white">
              @switch (viewMode()) {
                @case ('members') {
                  @for (member of members(); track member.id) {
                    <tr class="border-b border-white/5 hover:bg-white/5 transition-colors group">
                      <td class="px-10 py-7 font-bold text-xs">
                        {{ member.firstName }} {{ member.lastName }}
                      </td>
                      <td class="px-10 py-7 font-bold text-xs">{{ member.email }}</td>
                      <td class="px-10 py-7 font-bold text-xs">
                        {{ member.joinDate | date: 'medium' }}
                      </td>
                      <td class="px-10 py-7 text-right">
                        <button
                          class="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <svg
                            class="size-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="2.5"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  }
                  @if (members().length === 0) {
                    <tr>
                      <td colspan="4" class="px-10 py-16 text-center">
                        <span
                          class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500"
                          >No Active Members</span
                        >
                      </td>
                    </tr>
                  }
                }
                @case ('invitations') {
                  @for (invite of invitations(); track invite.id) {
                    <tr class="border-b border-white/5 hover:bg-white/5 transition-colors group">
                      <td class="px-10 py-7 font-bold text-xs">
                        {{ invite.firstName }} {{ invite.lastName }}
                      </td>
                      <td class="px-10 py-7 font-bold text-xs">{{ invite.email }}</td>
                      <td class="px-10 py-7 font-bold text-xs uppercase">{{ invite.status }}</td>
                      <td class="px-10 py-7 text-right"></td>
                    </tr>
                  }
                  @if (invitations().length === 0) {
                    <tr>
                      <td colspan="4" class="px-10 py-16 text-center">
                        <span
                          class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500"
                          >No Pending Invitations</span
                        >
                      </td>
                    </tr>
                  }
                }
              }
            </tbody>
          </table>
          <div #scrollSentinel class="h-20 w-full"></div>
        </div>
      }
    </div>

    <dialog
      #inviteModal
      class="bg-[#0b1120] border border-white/10 rounded-3xl p-8 backdrop:bg-black/80 backdrop:backdrop-blur-sm shadow-2xl max-w-md w-full m-auto"
    >
      <h3 class="text-white text-sm font-black uppercase mb-6 text-center">Invite New Member</h3>
      <div class="space-y-3">
        <input
          [(ngModel)]="inviteFirstName"
          placeholder="First Name"
          class="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white text-[11px] outline-none"
        />
        <input
          [(ngModel)]="inviteLastName"
          placeholder="Last Name"
          class="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white text-[11px] outline-none"
        />
        <input
          [(ngModel)]="inviteEmail"
          type="email"
          placeholder="Email Address"
          class="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white text-[11px] outline-none"
        />
      </div>
      <div class="grid grid-cols-2 gap-3 pt-6">
        <button
          (click)="inviteModal.close()"
          class="p-3 rounded-xl bg-white/5 text-white text-[10px] font-black uppercase cursor-pointer"
        >
          Cancel
        </button>
        <button
          (click)="sendInvite()"
          class="p-3 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase cursor-pointer"
        >
          Send Invitation
        </button>
      </div>
    </dialog>
  `,
})
export class ManagerMembers {
  private notificationService = inject(NotificationService);
  private identityService = inject(IdentityService);
  private tenantService = inject(TenantService);

  @ViewChild('scrollSentinel') scrollSentinel!: ElementRef;
  @ViewChild('inviteModal') inviteModal!: ElementRef<HTMLDialogElement>;

  viewMode = signal<'members' | 'invitations'>('members');
  members = signal<IdentityResponse[]>([]);
  invitations = signal<OrganizationInvitationResponse[]>([]);
  memberCount = signal(0);
  inviteCount = signal(0);
  isLoading = signal(false);
  currentPage = signal(0);

  inviteEmail = '';
  inviteFirstName = '';
  inviteLastName = '';

  constructor() {
    effect(() => {
      this.viewMode();
      this.tenantService.tenantId();
      untracked(() => this.resetAndReload());
    });
  }

  ngAfterViewInit() {
    // Now it is guaranteed that this.scrollSentinel is defined
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !this.isLoading()) {
        this.loadData();
      }
    });

    if (this.scrollSentinel) {
      observer.observe(this.scrollSentinel.nativeElement);
    }
  }

  resetAndReload() {
    this.currentPage.set(0);
    this.members.set([]);
    this.invitations.set([]);
    this.loadData();
  }

  loadData() {
    if (this.isLoading()) return;
    this.isLoading.set(true);

    switch (this.viewMode()) {
      case 'members':
        this.identityService.getOrganizationMembers(this.currentPage(), 10).subscribe({
          next: (res) => {
            const newMembers = res._embedded?.identityResponseList || [];
            this.members.update((prev) => [...prev, ...newMembers]);
            this.memberCount.set(res.page.totalElements);
            this.currentPage.update((p) => p + 1);
            this.isLoading.set(false);
          },
          error: () => {
            this.isLoading.set(false);
            this.notificationService.error('Failed to load members.');
          },
        });
        break;
      case 'invitations':
        this.identityService.getOrganizationInvitations().subscribe({
          next: (res) => {
            this.invitations.set(res);
            this.inviteCount.set(res.length);
            this.isLoading.set(false);
          },
          error: () => {
            this.isLoading.set(false);
            this.notificationService.error('Failed to load invitations.');
          },
        });
        break;
    }
  }

  sendInvite() {
    this.identityService
      .inviteMember({
        email: this.inviteEmail,
        firstName: this.inviteFirstName,
        lastName: this.inviteLastName,
      })
      .subscribe({
        next: () => {
          this.notificationService.success('Invite sent!');
          this.inviteModal.nativeElement.close();
          this.resetAndReload();
        },
      });
  }
}

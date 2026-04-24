// notification.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (notificationService.notification().visible) {
      <div class="fixed top-6 right-6 z-100 animate-in fade-in slide-in-from-top-4 duration-300 p-2">
        <div
          [class]="
            'flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl ' +
            getNotificationClasses()
          "
        >
          <!-- Optional: Add an icon based on notification type -->
          <div class="size-5">
            @switch (notificationService.notification().type) {
              @case ('success') {
                <svg class="text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              }
              @case ('error') {
                <svg class="text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              }
              @case ('warning') {
                <svg class="text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
              @default {
                <svg class="text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            }
          </div>
          
          <span class="text-[11px] font-black uppercase tracking-[0.15em] flex-1">
            {{ notificationService.notification().message }}
          </span>
          
          <button
            (click)="notificationService.hide()"
            class="ml-2 hover:opacity-70 transition-opacity cursor-pointer"
            aria-label="Close notification"
          >
            <svg class="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      position: fixed;
      top: 0;
      right: 0;
      z-index: 1000;
      pointer-events: none;
    }
    
    .fixed {
      pointer-events: auto;
    }
  `]
})
export class NotificationComponent {
  notificationService = inject(NotificationService);

  getNotificationClasses(): string {
    const type = this.notificationService.notification().type;
    switch (type) {
      case 'success':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'error':
        return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      default:
        return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400';
    }
  }
}
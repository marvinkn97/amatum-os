// services/notification.service.ts
import { Injectable, signal } from '@angular/core';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  visible: boolean;
  duration: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  // Default duration for notifications (4 seconds)
  private readonly DEFAULT_DURATION = 4000;

  private notificationSignal = signal<Notification>({
    message: '',
    type: 'info',
    visible: false,
    duration: this.DEFAULT_DURATION,
  });

  // Expose readonly signal for components
  readonly notification = this.notificationSignal.asReadonly();

  /**
   * Show a notification toast
   * @param message The message to display
   * @param type The type of notification (success, error, info, warning)
   * @param duration Duration in milliseconds (defaults to DEFAULT_DURATION)
   */
  show(
    message: string,
    type: Notification['type'] = 'info',
    duration: number = this.DEFAULT_DURATION,
  ): void {
    // Clear any existing notification timer
    this.clearTimer();

    // Set the new notification
    this.notificationSignal.set({
      message,
      type,
      visible: true,
      duration,
    });

    // Auto-hide after duration
    this.timer = setTimeout(() => {
      this.hide();
    }, duration);
  }

  /**
   * Show a success notification with custom duration
   */
  success(message: string, duration: number = this.DEFAULT_DURATION): void {
    this.show(message, 'success', duration);
  }

  /**
   * Show an error notification with custom duration
   */
  error(message: string, duration: number = this.DEFAULT_DURATION): void {
    this.show(message, 'error', duration);
  }

  /**
   * Show an info notification with custom duration
   */
  info(message: string, duration: number = this.DEFAULT_DURATION): void {
    this.show(message, 'info', duration);
  }

  /**
   * Show a warning notification with custom duration
   */
  warning(message: string, duration: number = this.DEFAULT_DURATION): void {
    this.show(message, 'warning', duration);
  }

  /**
   * Hide the current notification
   */
  hide(): void {
    this.notificationSignal.update((n) => ({ ...n, visible: false }));
    this.clearTimer();
  }

  private timer: any = null;

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

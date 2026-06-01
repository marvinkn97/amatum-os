import { CommonModule } from '@angular/common';
import { Component, inject, model, signal, ViewChild, ElementRef, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TalemaiService } from '../../../services/talemai.service';
import { MarkdownComponent } from 'ngx-markdown';
import { ChatService } from '../../../services/chat.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownComponent],
  template: `
    @if (isOpen()) {
      <div
        (click)="isOpen.set(false)"
        class="fixed inset-0 bg-black/20 backdrop-blur-sm z-80 transition-all"
      ></div>
    }

    <aside
      [class.translate-x-0]="isOpen()"
      [class.translate-x-full]="!isOpen()"
      class="fixed top-16 z-90 right-0 h-[calc(100%-4rem)] w-full lg:w-130 xl:w-155 max-w-full bg-[#0b1120]/95 backdrop-blur-2xl border-l border-white/5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xl shadow-black"
    >
      <div class="flex flex-col h-full">
        <div class="p-4 sm:p-5 border-b border-white/5 bg-[#0b1120]/80 backdrop-blur-xl">
          <div class="flex items-center justify-between gap-3 min-w-0">
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <div
                class="size-6 shrink-0 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20"
              >
                <svg
                  class="size-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="font-bold text-sm text-white truncate">TALEMAI</h3>
                <p
                  class="text-[9px] text-indigo-400 font-bold uppercase tracking-[0.25em] truncate"
                >
                  AI Assistant
                </p>
              </div>
            </div>
            <button (click)="isOpen.set(false)" class="size-9 text-slate-400 cursor-pointer">
              <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div #scrollContainer class="flex-1 overflow-y-auto p-6 space-y-4">
          @for (msg of messages(); track $index) {
            <div
              class="rounded-2xl p-4 border border-white/5 text-sm"
              [ngClass]="
                msg.role === 'user'
                  ? 'bg-indigo-600/20 text-white ml-auto max-w-[80%]'
                  : 'bg-white/5 text-slate-300'
              "
            >
              @if (msg.role === 'ai') {
                <markdown [data]="msg.text"></markdown>
              } @else {
                {{ msg.text }}
              }
            </div>
          }

          @if (isLoading()) {
            <div class="flex gap-1.5 px-4 py-3">
              <div
                class="size-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"
              ></div>
              <div
                class="size-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"
              ></div>
              <div class="size-2 bg-indigo-500 rounded-full animate-bounce"></div>
            </div>
          }
        </div>

        <div class="p-6 border-t border-white/5 bg-white/2">
          <div class="relative">
            <input
              [(ngModel)]="userQuery"
              (keyup.enter)="sendMessage()"
              type="text"
              placeholder="Ask anything..."
              class="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-indigo-500 outline-none transition-all pr-14"
            />
            <button
              (click)="sendMessage()"
              [disabled]="isLoading()"
              class="absolute right-2 top-2 size-10 bg-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
            >
              <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M5 12h14M12 5l7 7-7 7" stroke-width="2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </aside>
  `,
})
export class AiAssistant {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  isOpen = model(false);
  private talemaiService = inject(TalemaiService);
  private chatService = inject(ChatService);
  private notificationService = inject(NotificationService);

  userQuery = signal('');
  messages = this.chatService.messages;
  isLoading = signal(false);

  constructor() {
    effect(() => {
      // Track signals to trigger scroll on update
      this.messages();
      this.isLoading();

      // Scroll to bottom after view updates
      setTimeout(() => {
        if (this.scrollContainer) {
          this.scrollContainer.nativeElement.scrollTop =
            this.scrollContainer.nativeElement.scrollHeight;
        }
      });
    });
  }

  sendMessage() {
    const query = this.userQuery().trim();
    if (!query || this.isLoading()) return;

    this.messages.update((prev) => [...prev, { role: 'user', text: query }]);
    this.userQuery.set('');
    this.isLoading.set(true);

    this.talemaiService.sendMessage(query).subscribe({
      next: (response: string) => {
        this.messages.update((prev) => [...prev, { role: 'ai', text: response }]);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('AI Connection Failed:', err);
        this.notificationService.error(
          "I'm sorry, I hit a snag and couldn't process that. Please try again",
        );
        this.isLoading.set(false);
      },
    });
  }
}

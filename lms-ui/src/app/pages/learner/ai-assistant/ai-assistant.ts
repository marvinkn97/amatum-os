import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  model,
  signal,
  viewChild,
  ElementRef,
  effect,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TalemaiService } from '../../../services/talemai.service';
import { MarkdownComponent } from 'ngx-markdown';
import { ChatService } from '../../../services/chat.service';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';

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
      class="fixed top-16 z-90 right-0 h-[calc(100%-4rem)] w-full lg:w-130 xl:w-155 max-w-full bg-[#0b1120]/95 backdrop-blur-2xl border-l border-white/5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xl shadow-black flex flex-col"
    >
      <!-- Terminal/Assistant Window Title Bar -->
      <div class="px-6 py-4 bg-white/2 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="flex gap-1.5">
            <div class="size-3 rounded-full bg-rose-500/80"></div>
            <div class="size-3 rounded-full bg-amber-500/80"></div>
            <div class="size-3 rounded-full bg-indigo-500/80"></div>
          </div>
          <span class="text-xs font-bold text-slate-400 ml-2 font-mono">talemai://learning-assistant</span>
        </div>

        <button
          type="button"
          (click)="isOpen.set(false)"
          class="size-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
          aria-label="Close Assistant"
        >
          <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Chat Stream Body -->
      <div #scrollContainer class="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">
        @if (messages().length === 0) {
          <div class="h-full flex flex-col items-center justify-center text-center px-4 text-slate-500 space-y-3">
            <div class="size-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p class="text-xs font-mono text-slate-400">Type any query below to interact with Talemai.</p>
          </div>
        }

        @for (msg of messages(); track $index) {
          <div class="flex items-start gap-4">
            @if (msg.role === 'ai') {
              <div class="size-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-xs shrink-0 shadow-lg shadow-indigo-900/20">
                <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="flex-1 bg-white/3 border border-white/5 rounded-2xl p-4 text-slate-200 text-xs md:text-sm leading-relaxed shadow-inner">
                <markdown [data]="msg.text" class="prose prose-invert max-w-none text-xs md:text-sm"></markdown>
              </div>
            } @else {
              <div class="size-8 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 font-bold text-xs shrink-0 ml-auto order-2">
                <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div class="flex-1 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-4 text-white text-xs md:text-sm leading-relaxed ml-12 order-1 flex flex-col gap-2">
                <div>{{ msg.text }}</div>

                @if (msg.status === 'failed') {
                  <div class="flex items-center justify-between gap-3 pt-2 border-t border-red-500/20 mt-1">
                    <span class="text-[11px] text-red-400">Failed to send.</span>
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        (click)="retryMessage($index)"
                        [disabled]="isLoading()"
                        class="text-[11px] text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                      >
                        Retry
                      </button>
                      <span class="text-slate-600">•</span>
                      <button
                        type="button"
                        (click)="deleteMessage($index)"
                        [disabled]="isLoading()"
                        class="text-[11px] text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }

        @if (isLoading()) {
          <div class="flex items-center gap-1.5 px-4 py-3 bg-white/3 border border-white/5 rounded-2xl w-fit">
            <div class="size-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div class="size-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div class="size-2 bg-indigo-500 rounded-full animate-bounce"></div>
          </div>
        }
      </div>

      <!-- Chat Input Bar -->
      <div class="p-4 md:p-6 bg-white/1 shrink-0">
        <div class="relative flex items-center">
          <span class="absolute left-4 text-indigo-500 font-mono text-sm font-bold">></span>
          <input
            [(ngModel)]="userQuery"
            (keyup.enter)="sendMessage()"
            type="text"
            placeholder="Type your query..."
            class="w-full bg-black/40 border border-white/10 rounded-2xl pl-9 pr-14 py-4 text-xs md:text-sm focus:border-indigo-500/50 outline-none transition-all text-white placeholder-slate-500 shadow-inner"
          />

          <button
            type="button"
            (click)="sendMessage()"
            [disabled]="isLoading() || !userQuery().trim()"
            class="absolute right-2 size-10 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-indigo-500/20 cursor-pointer disabled:cursor-not-allowed"
            aria-label="Send Message"
          >
            <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  `,
  styles: [
    `
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.02);
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
      }
    `,
  ],
})
export class AiAssistant {
  private readonly scrollContainer = viewChild<ElementRef<HTMLDivElement>>('scrollContainer');

  readonly isOpen = model(false);

  private readonly talemaiService = inject(TalemaiService);
  private readonly chatService = inject(ChatService);
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);

  readonly userQuery = signal('');
  readonly messages = this.chatService.messages;
  readonly isLoading = signal(false);

  constructor() {
    effect(() => {
      const userId = this.authService.subject();

      if (userId) {
        this.chatService.initialize(userId);
      } else {
        this.chatService.reset();
      }
    });

    effect(() => {
      this.messages();
      this.isLoading();

      setTimeout(() => {
        const container = this.scrollContainer()?.nativeElement;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    });
  }

  sendMessage(): void {
    const query = this.userQuery().trim();

    if (!query || this.isLoading()) {
      return;
    }

    const messageIndex = this.messages().length;

    this.messages.update((prev) => [
      ...prev,
      {
        role: 'user',
        text: query,
        status: 'sent',
      },
    ]);

    this.userQuery.set('');
    this.sendQuery(query, messageIndex);
  }

  private sendQuery(query: string, messageIndex: number): void {
    this.isLoading.set(true);

    let aiMessageCreated = false;

    this.talemaiService.sendMessage(query).subscribe({
      next: (chunk) => {
        this.messages.update((prev) => {
          const messages = [...prev];

          if (!aiMessageCreated) {
            messages.push({
              role: 'ai',
              text: chunk,
            });

            aiMessageCreated = true;
          } else {
            const lastIndex = messages.length - 1;

            messages[lastIndex] = {
              ...messages[lastIndex],
              text: messages[lastIndex].text + chunk,
            };
          }

          return messages;
        });
      },

      error: (err) => {
        console.error('AI Connection Failed:', err);

        if (aiMessageCreated) {
          this.messages.update((prev) => {
            const messages = [...prev];

            if (messages[messages.length - 1]?.role === 'ai') {
              messages.pop();
            }

            return messages;
          });
        }

        this.messages.update((prev) => {
          const messages = [...prev];

          if (messages[messageIndex]) {
            messages[messageIndex] = {
              ...messages[messageIndex],
              status: 'failed',
            };
          }

          return messages;
        });

        this.notificationService.error(
          "I'm sorry, I hit a snag and couldn't process that. Please try again.",
        );

        this.isLoading.set(false);
      },

      complete: () => {
        this.isLoading.set(false);
      },
    });
  }

  retryMessage(index: number): void {
    const message = this.messages()[index];

    if (
      !message ||
      message.role !== 'user' ||
      message.status !== 'failed' ||
      this.isLoading()
    ) {
      return;
    }

    this.messages.update((prev) => {
      const messages = [...prev];

      messages[index] = {
        ...messages[index],
        status: 'sent',
      };

      return messages;
    });

    this.sendQuery(message.text, index);
  }

  deleteMessage(index: number): void {
    const message = this.messages()[index];

    if (
      !message ||
      message.role !== 'user' ||
      message.status !== 'failed'
    ) {
      return;
    }

    this.chatService.removeMessage(index);
  }
}
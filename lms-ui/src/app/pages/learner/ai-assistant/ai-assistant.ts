import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  model,
  signal,
  ViewChild,
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

            <button
              (click)="isOpen.set(false)"
              class="size-9 text-slate-400 cursor-pointer"
            >
              <svg
                class="size-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
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
                  ? msg.status === 'failed'
                    ? 'bg-indigo-600/20 text-white ml-auto max-w-[80%] border-red-500/30'
                    : 'bg-indigo-600/20 text-white ml-auto max-w-[80%]'
                  : 'bg-white/5 text-slate-300'
              "
            >
              @if (msg.role === 'ai') {
                <markdown [data]="msg.text"></markdown>
              } @else {
                <div class="flex flex-col gap-2">
                  <div>
                    {{ msg.text }}
                  </div>

                  @if (msg.status === 'failed') {
                    <div class="flex items-center justify-between gap-3 pt-2">
                      <span class="text-xs text-red-400">
                        Failed to send. Tap retry.
                      </span>

                      <div class="flex items-center gap-2">
                        <!-- Retry -->
                        <button
                          type="button"
                          (click)="retryMessage($index)"
                          [disabled]="isLoading()"
                          class="size-8 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                          title="Retry"
                        >
                          <svg
                            class="size-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                        </button>

                        <!-- Delete -->
                        <button
                          type="button"
                          (click)="deleteMessage($index)"
                          [disabled]="isLoading()"
                          class="size-8 rounded-lg bg-white/10 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                          title="Delete"
                        >
                          <svg
                            class="size-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  }
                </div>
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

              <div
                class="size-2 bg-indigo-500 rounded-full animate-bounce"
              ></div>
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
              class="absolute right-2 top-2 size-10 bg-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                class="size-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  d="M5 12h14M12 5l7 7-7 7"
                  stroke-width="2"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </aside>
  `,
})
export class AiAssistant {
  @ViewChild('scrollContainer')
  private scrollContainer!: ElementRef;

  isOpen = model(false);

  private talemaiService = inject(TalemaiService);
  private chatService = inject(ChatService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  userQuery = signal('');
  messages = this.chatService.messages;
  isLoading = signal(false);

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
        if (this.scrollContainer) {
          this.scrollContainer.nativeElement.scrollTop =
            this.scrollContainer.nativeElement.scrollHeight;
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

    // Add user message immediately.
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
            // Create the AI message only when the first
            // response chunk actually arrives.
            messages.push({
              role: 'ai',
              text: chunk,
            });

            aiMessageCreated = true;
          } else {
            // Append subsequent streamed chunks.
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

        /*
         * If the backend started streaming a response but then
         * failed, remove the incomplete AI response.
         */
        if (aiMessageCreated) {
          this.messages.update((prev) => {
            const messages = [...prev];

            if (messages[messages.length - 1]?.role === 'ai') {
              messages.pop();
            }

            return messages;
          });
        }

        /*
         * Keep the user's message but mark it as failed.
         * This gives the user the option to retry or delete it.
         */
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

    // Mark the existing message as being retried.
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
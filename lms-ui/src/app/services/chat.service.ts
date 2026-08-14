import { Injectable, signal, effect } from '@angular/core';

export interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  status?: 'sending' | 'sent' | 'failed';
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly STORAGE_PREFIX = 'talemai_chat_';

  messages = signal<ChatMessage[]>([]);

  private currentUserId: string | null = null;

  constructor() {
    effect(() => {
      const userId = this.currentUserId;

      if (!userId) {
        return;
      }

      sessionStorage.setItem(
        this.getStorageKey(userId),
        JSON.stringify(this.messages()),
      );
    });
  }

  initialize(userId: string): void {
    // Don't reload unnecessarily for the same user
    if (this.currentUserId === userId) {
      return;
    }

    this.currentUserId = userId;

    const saved = sessionStorage.getItem(this.getStorageKey(userId));

    this.messages.set(
      saved
        ? JSON.parse(saved)
        : [this.createWelcomeMessage()],
    );
  }

  clearChat(): void {
    if (this.currentUserId) {
      sessionStorage.removeItem(this.getStorageKey(this.currentUserId));
    }

    this.messages.set([this.createWelcomeMessage()]);
  }

  reset(): void {
    this.currentUserId = null;
    this.messages.set([]);
  }

  addMessage(
    role: ChatMessage['role'],
    text: string,
    status: ChatMessage['status'] = 'sent',
  ): void {
    this.messages.update((prev) => [
      ...prev,
      {
        role,
        text,
        status,
      },
    ]);
  }

  addUserMessage(text: string): number {
    let messageIndex = -1;

    this.messages.update((prev) => {
      messageIndex = prev.length;

      return [
        ...prev,
        {
          role: 'user',
          text,
          status: 'sending',
        },
      ];
    });

    return messageIndex;
  }

  markMessageSent(index: number): void {
    this.messages.update((prev) => {
      if (!prev[index]) {
        return prev;
      }

      const messages = [...prev];

      messages[index] = {
        ...messages[index],
        status: 'sent',
      };

      return messages;
    });
  }

  markMessageFailed(index: number): void {
    this.messages.update((prev) => {
      if (!prev[index]) {
        return prev;
      }

      const messages = [...prev];

      messages[index] = {
        ...messages[index],
        status: 'failed',
      };

      return messages;
    });
  }

  updateMessage(index: number, text: string): void {
    this.messages.update((prev) => {
      if (!prev[index]) {
        return prev;
      }

      const messages = [...prev];

      messages[index] = {
        ...messages[index],
        text,
      };

      return messages;
    });
  }

  appendToMessage(index: number, chunk: string): void {
    this.messages.update((prev) => {
      if (!prev[index]) {
        return prev;
      }

      const messages = [...prev];

      messages[index] = {
        ...messages[index],
        text: messages[index].text + chunk,
      };

      return messages;
    });
  }

  removeMessage(index: number): void {
    this.messages.update((prev) =>
      prev.filter((_, i) => i !== index),
    );
  }

  getMessage(index: number): ChatMessage | undefined {
    return this.messages()[index];
  }

  private getStorageKey(userId: string): string {
    return `${this.STORAGE_PREFIX}${userId}`;
  }

  private createWelcomeMessage(): ChatMessage {
    return {
      role: 'ai',
      text: "Hello! I'm TALEMAI, your personal learning assistant. Tell me what you would like to learn and I will find the perfect course for you!",
      status: 'sent',
    };
  }
}
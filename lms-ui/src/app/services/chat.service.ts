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

  // AI typing state
  private typingQueue = '';
  private typingTimer: ReturnType<typeof setTimeout> | null = null;
  private typingMessageIndex: number | null = null;
  private isTyping = false;

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
    if (this.currentUserId === userId) {
      return;
    }

    this.stopTyping();

    this.currentUserId = userId;

    const saved = sessionStorage.getItem(this.getStorageKey(userId));

    this.messages.set(
      saved
        ? JSON.parse(saved)
        : [this.createWelcomeMessage()],
    );
  }

  clearChat(): void {
    this.stopTyping();

    if (this.currentUserId) {
      sessionStorage.removeItem(
        this.getStorageKey(this.currentUserId),
      );
    }

    this.messages.set([this.createWelcomeMessage()]);
  }

  reset(): void {
    this.stopTyping();

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

  /**
   * Adds incoming AI chunks to a queue and displays them
   * progressively in small batches.
   */
  queueMessageChunk(index: number, chunk: string): void {
    if (!chunk) {
      return;
    }

    // If a different AI message is being typed,
    // stop the previous typing process.
    if (
      this.typingMessageIndex !== null &&
      this.typingMessageIndex !== index
    ) {
      this.stopTyping();
    }

    this.typingMessageIndex = index;
    this.typingQueue += chunk;

    if (!this.isTyping) {
      this.processTypingQueue();
    }
  }

  /**
   * Call this when the backend has finished streaming.
   * It ensures everything remaining in the queue is displayed.
   */
  finishTyping(): void {
    if (this.typingMessageIndex === null) {
      return;
    }

    if (this.typingQueue.length > 0) {
      this.appendToMessage(
        this.typingMessageIndex,
        this.typingQueue,
      );
    }

    this.stopTyping();
  }

  private processTypingQueue(): void {
    if (
      !this.typingQueue.length ||
      this.typingMessageIndex === null
    ) {
      this.isTyping = false;
      this.typingTimer = null;
      return;
    }

    this.isTyping = true;

    // Display small batches rather than one character at a time.
    const batchSize = Math.min(
      this.typingQueue.length,
      this.typingQueue.length > 20 ? 3 : 2,
    );

    const batch = this.typingQueue.substring(0, batchSize);

    this.typingQueue = this.typingQueue.substring(batchSize);

    this.appendToMessage(
      this.typingMessageIndex,
      batch,
    );

    // Slightly longer pause after punctuation.
    const delay = /[.!?,:;]\s*$/.test(batch)
      ? 50
      : 20;

    this.typingTimer = setTimeout(() => {
      this.processTypingQueue();
    }, delay);
  }

  private stopTyping(): void {
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }

    this.typingTimer = null;
    this.typingQueue = '';
    this.typingMessageIndex = null;
    this.isTyping = false;
  }

  removeMessage(index: number): void {
    if (this.typingMessageIndex === index) {
      this.stopTyping();
    }

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
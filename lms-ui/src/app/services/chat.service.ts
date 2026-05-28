import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly SESSION_KEY = 'talemai_chat_session';

  // Initialize from sessionStorage to survive F5 refreshes
  messages = signal<{ role: 'user' | 'ai'; text: string }[]>(
    this.loadFromSession()
  );

  constructor() {
    // Keep session storage in sync with our state automatically
    effect(() => {
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(this.messages()));
    });
  }

  private loadFromSession() {
    const saved = sessionStorage.getItem(this.SESSION_KEY);
    return saved 
      ? JSON.parse(saved) 
      : [{ role: 'ai', text: "Hello! I'm TALEMAI. How can I help you today?" }];
  }

  addMessage(role: 'user' | 'ai', text: string) {
    this.messages.update((prev) => [...prev, { role, text }]);
  }

  clearChat() {
    sessionStorage.removeItem(this.SESSION_KEY);
    this.messages.set([{ role: 'ai', text: "Hello! I'm TALEMAI. How can I help you today?" }]);
  }
}
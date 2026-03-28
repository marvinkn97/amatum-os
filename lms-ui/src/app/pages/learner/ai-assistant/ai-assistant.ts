import { CommonModule } from '@angular/common';
import { Component, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen()) {
      <div (click)="isOpen.set(false)" class="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-all"></div>
    }

    <aside 
      [class.translate-x-0]="isOpen()"
      [class.translate-x-full]="!isOpen()"
      class="fixed top-0 right-0 h-screen w-full sm:w-100 bg-[#0b1120]/90 backdrop-blur-2xl border-l border-white/5 z-60 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xl shadow-black"
    >
      <div class="flex flex-col h-full">
        <div class="p-6 border-b border-white/5 flex justify-between items-center">
          <div class="flex items-center gap-3">
            <div class="size-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg class="size-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 class="font-black text-sm tracking-tight">AMAI</h3>
              <p class="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">AI Assistant</p>
            </div>
          </div>
          <button (click)="isOpen.set(false)" class="text-slate-500 hover:text-white transition-colors">
            <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" stroke-width="2"/></svg>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-4">
          <div class="bg-white/5 rounded-2xl p-4 border border-white/5 text-sm text-slate-300">
            Hello! I'm AMAI, your AI assistant. I can help you with a variety of tasks, such as answering questions, providing explanations, and assisting with your learning journey. Just type in your query below and I'll do my best to assist you!
          </div>
        </div>

        <div class="p-6 border-t border-white/5 bg-white/2">
          <div class="relative">
            <input 
              type="text" 
              placeholder="Ask anything..."
              class="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-indigo-500 outline-none transition-all pr-14"
            />
            <button class="absolute right-2 top-2 size-10 bg-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20">
              <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 12h14M12 5l7 7-7 7" stroke-width="2"/></svg>
            </button>
          </div>
        </div>
      </div>
    </aside>
  `
})
export class AiAssistant {
  isOpen = model(false);


}
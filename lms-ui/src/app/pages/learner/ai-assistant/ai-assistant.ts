import { CommonModule } from '@angular/common';
import { Component, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen()) {
      <div
        (click)="isOpen.set(false)"
        class="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-all"
      ></div>
    }

    <aside
      [class.translate-x-0]="isOpen()"
      [class.translate-x-full]="!isOpen()"
      class="fixed top-16 z-200 right-0 h-[calc(100%-4rem)] w-full lg:w-130 xl:w-155 max-w-full bg-[#0b1120]/95 backdrop-blur-2xl border-l border-white/5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xl shadow-black"
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
                <h3 class="font-bold text-sm sm:text-sm tracking-tight text-white truncate">
                  TALEMAI
                </h3>

                <p
                  class="text-[9px] sm:text-[10px] text-indigo-400 font-bold uppercase tracking-[0.25em] truncate"
                >
                  AI Assistant
                </p>
              </div>
            </div>

            <button
              (click)="isOpen.set(false)"
              class="size-9 shrink-0  rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all flex items-center justify-center"
            >
              <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-4">
          <div class="bg-white/5 rounded-2xl p-4 border border-white/5 text-sm text-slate-300">
            Hello! I'm TALEMAI, your AI assistant. I can help you with a variety of tasks, such as
            answering questions, providing explanations, and assisting with your learning journey.
            Just type in your query below and I'll do my best to assist you!
          </div>
        </div>

        <div class="p-6 border-t border-white/5 bg-white/2">
          <div class="relative">
            <input
              type="text"
              placeholder="Ask anything..."
              class="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-indigo-500 outline-none transition-all pr-14"
            />
            <button
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
  isOpen = model(false);
}

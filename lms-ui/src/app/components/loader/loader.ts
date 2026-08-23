import { Component } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  template: `
    <div class="w-full min-h-[60vh flex items-center justify-center">
      <div class="flex items-center gap-2">
        <div
          class="size-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"
        ></div>

        <div
          class="size-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"
        ></div>

        <div
          class="size-1.5 bg-indigo-500 rounded-full animate-bounce"
        ></div>

        <span
          class="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] ml-2"
        >
          Loading
        </span>
      </div>
    </div>
  `,
})
export class Loader {}
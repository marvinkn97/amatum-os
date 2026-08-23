import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (type() === 'spinner') {
      <div [class]="containerClass()">
        <div class="flex items-center gap-2">
          <div
            class="size-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"
          ></div>
          <div
            class="size-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"
          ></div>
          <div class="size-1.5 bg-indigo-500 rounded-full animate-bounce"></div>

          @if (showText()) {
            <span class="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] ml-2">
              {{ text() }}
            </span>
          }
        </div>
      </div>
    } @else if (type() === 'skeleton-card') {
      <div
        class="bg-white/2 border border-white/5 rounded-[2.5rem] h-80 overflow-hidden flex flex-col animate-pulse backdrop-blur-md"
      >
        <div class="h-32 bg-white/5"></div>
        <div class="p-8 space-y-8 flex-1">
          <div class="h-4 w-full bg-white/10 rounded-lg"></div>
          <div class="space-y-3">
            <div class="h-1 w-10 bg-white/10 rounded"></div>
            <div class="h-2 w-full bg-white/5 rounded-full"></div>
          </div>
        </div>
      </div>
    }
  `,
})
export class Loader {
  type = input<'spinner' | 'skeleton-card'>('spinner');
  containerClass = input<string>('w-full min-h-[60vh] flex items-center justify-center');
  showText = input<boolean>(true);
  text = input<string>('Loading');
}

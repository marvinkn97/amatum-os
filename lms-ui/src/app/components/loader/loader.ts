import { Component } from '@angular/core';

@Component({
  selector: 'app-loader',
  imports: [],
  template: ` <div class="flex gap-2 items-center">
    <div class="size-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div class="size-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div class="size-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
    <span class="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] ml-2"
      >Loading</span
    >
  </div>`,
})
export class Loader {}

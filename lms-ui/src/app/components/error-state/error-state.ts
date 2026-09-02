import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  standalone: true,
  template: `
    <div
      class="p-6 md:p-10 border border-red-500/20 bg-red-500/5 backdrop-blur-xl rounded-3xl animate-in fade-in slide-in-from-top-4 duration-500"
    >
      <div class="flex flex-col items-center text-center space-y-4">
        <div
          class="size-12 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 mb-2"
        >
          <svg
            class="size-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h2
          class="text-xs font-black text-red-400 uppercase tracking-[0.3em]"
        >
          {{ title() }}
        </h2>

        <p class="text-sm text-slate-400 max-w-xs mx-auto font-medium">
          {{ message() }}
        </p>

        <button
          type="button"
          (click)="retry.emit()"
          class="mt-4 px-8 py-2.5 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-400 transition-all shadow-lg shadow-red-500/20 cursor-pointer"
        >
          Retry
        </button>
      </div>
    </div>
  `,
})
export class ErrorStateComponent {
  title = input('Something went wrong');
  message = input('We could not complete your request. Please try again.');

  retry = output<void>();
}
import { Component } from '@angular/core';

@Component({
  selector: 'app-manager-organization',
  imports: [],
  template: `
    <div
      class="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20 px-4 md:px-6 w-full"
    >
      <header
        class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10"
      >
        <div>
          <h1 class="text-md font-black text-white italic tracking-tighter mb-2 uppercase">
            Organization Settings
          </h1>
          <p class="text-slate-500 text-sm font-medium">
            Manage your organization's profile, team, billing, and settings.
          </p>
        </div>
      </header>
    </div>
  `,
})
export class Organization {}

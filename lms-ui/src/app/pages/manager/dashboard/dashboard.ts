import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Manager Dashboard</h1>
      <p>Welcome to the Manager Dashboard!</p>
    </div>
   `,
})
export class ManagerDashboard {
}
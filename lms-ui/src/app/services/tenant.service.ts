import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root' // This makes it a singleton available everywhere
})
export class TenantService {
  // This is your signal!
  private _currentTenantId = signal<string | null>(null);

  // Expose it as a read-only signal for the Interceptor
  readonly tenantId = this._currentTenantId.asReadonly();

  // Method for the Layout to update the ID
  setTenantId(id: string | null) {
    this._currentTenantId.set(id);
  }
}
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private readonly _currentTenantId = signal<string | null>(null);

  readonly tenantId = this._currentTenantId.asReadonly();

  setTenantId(id: string | null) {
    this._currentTenantId.set(id);
  }
}

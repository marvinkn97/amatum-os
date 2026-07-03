import { InjectionToken, signal } from '@angular/core';

export const ACTIVE_TENANT_ID = new InjectionToken<ReturnType<typeof signal<string | null>>>(
  'active.tenant.id', 
  { factory: () => signal<string | null>(null) }
);
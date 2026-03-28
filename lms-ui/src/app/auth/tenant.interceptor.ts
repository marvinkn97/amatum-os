// tenant.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TenantService } from '../services/tenant.service';


export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const tenantService = inject(TenantService);
  const id = tenantService.tenantId(); // Get value from service

  if (id) {
    return next(req.clone({
      setHeaders: { 'X-Tenant-ID': id }
    }));
  }

  return next(req);
};
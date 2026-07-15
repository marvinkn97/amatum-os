import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const canActivateAuth: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.whenReady();

  const targetPath = state.url;

  if (!authService.isAuthenticated()) {
    await authService.login(targetPath);
    return false;
  }

  if (targetPath.startsWith('/choose-role') || targetPath.startsWith('/onboarding')) {
    return true;
  }

  const requiredRole = route.data?.['role'] as string | undefined;

  if (!requiredRole) {
    return true;
  }

  if (authService.hasRole(requiredRole)) {
    return true;
  }

  return router.parseUrl('/choose-role');
};

import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Keycloak from 'keycloak-js';

export const canActivateAuth = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const keycloak = inject(Keycloak);

  return async (route: any, state: any) => {
    const targetPath = state.url;
    if (authService.isLoading()) {
      while (authService.isLoading()) {
        await new Promise((resolve) => setTimeout(resolve, 5));
      }
    }

    if (!authService.isAuthenticated()) {
      await keycloak.login({ redirectUri: window.location.origin + targetPath });
      return false;
    }

    if (targetPath.includes('/choose-role') || targetPath.includes('/onboarding')) {
      return true;
    }

    const requiredRole = route.data['role'];
    if (!requiredRole) {
      return true;
    }

    if (authService.hasRole(requiredRole)) {
      return true;
    }

    return router.parseUrl('/choose-role');
  };
};

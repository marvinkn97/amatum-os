import { 
  ActivatedRouteSnapshot, 
  CanActivateFn, 
  Router, 
  RouterStateSnapshot, 
  UrlTree 
} from '@angular/router';
import { inject } from '@angular/core';
import { AuthGuardData, createAuthGuard } from 'keycloak-angular';
import Keycloak from 'keycloak-js';

const isAccessAllowed = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  authData: AuthGuardData
): Promise<boolean | UrlTree> => {
  const { authenticated, grantedRoles } = authData;
  const router = inject(Router);
  const keycloak = inject(Keycloak);

  // 1. If not authenticated, trigger login flow
  if (!authenticated) {
    const targetPath = state.url;
    // Uses window.location.origin to support localhost, staging, and prod dynamically
    await keycloak.login({
      redirectUri: `${window.location.origin}/auth/callback?target=${encodeURIComponent(targetPath)}`,
    });
    return false; 
  }

  // 2. Gateway Bypass: Always allow access to the Role Selection screen
  if (state.url.includes('/choose-role')) {
    return true;
  }

  // 3. Super Admin Universal Access
  // Checks Realm roles and Client-specific roles for the 'SUPER_ADMIN' permission
  const isSuperAdmin = keycloak.hasRealmRole('SUPER_ADMIN') || 
                       keycloak.hasResourceRole('SUPER_ADMIN', 'lms-ui');
                       
  if (isSuperAdmin) {
    return true; 
  }

  // 4. Specific Role Check
  // Expects route data: { role: 'MANAGER' } or { role: 'LEARNER' }
  const requiredRole = route.data['role'];
  
  // If no role is defined for this route, allow access (public or shared page)
  if (!requiredRole) {
    return true; 
  }

  // Verify the role against the 'lms-ui' client within the JWT
  const clientId = 'lms-ui';
  const hasRole = grantedRoles.resourceRoles[clientId]?.includes(requiredRole);

  if (hasRole) {
    return true;
  }

  // 5. Fallback: Unauthorized Access
  // If the user is logged in but doesn't have the specific role for this path,
  // redirect them to the choice screen to pick a workspace they DO have access to.
  return router.parseUrl('/choose-role');
};

/**
 * Functional Guard for Angular 17+ using keycloak-angular's createAuthGuard
 */
export const canActivateAuth = createAuthGuard<CanActivateFn>(isAccessAllowed);
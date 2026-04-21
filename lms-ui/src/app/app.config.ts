import { ApplicationConfig, provideBrowserGlobalErrorListeners, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideKeycloak,
  withAutoRefreshToken,
  AutoRefreshTokenService,
  UserActivityService,
  includeBearerTokenInterceptor,
  createInterceptorCondition,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  IncludeBearerTokenCondition,
} from 'keycloak-angular';

// Only attach token for your backend
const urlCondition = createInterceptorCondition<IncludeBearerTokenCondition>({
  urlPattern: /^(http:\/\/localhost:(8081|8082|8083))(\/.*)?$/i,
  bearerPrefix: 'Bearer',
});

import { routes } from './app.routes';
import { provideEchartsCore } from 'ngx-echarts';
import { environment } from '../environments/environment';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { tenantInterceptor } from './auth/tenant.interceptor';
import { ACTIVE_TENANT_ID } from './auth/tenant-context.token';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideKeycloak({
      config: {
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId,
      },
      initOptions: {
        // onLoad: 'check-sso',
        redirectUri: window.location.origin + '/auth/callback',
        checkLoginIframe: false, // Disable the login state iframe to avoid issues in certain environments
        scope: 'openid profile email organization:*',
      },
      features: [
        withAutoRefreshToken({
          onInactivityTimeout: 'logout',
          sessionTimeout: 900000, // 5 minutes (300,000ms) - better for testing
          // sessionTimeout: 900000, // 15 minutes - standard for production
        }),
      ],
      providers: [AutoRefreshTokenService, UserActivityService],
    }),
    // Provide the interceptor config
    {
      provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
      useValue: [urlCondition], // Add the condition to the interceptor config
    },
    {
      provide: ACTIVE_TENANT_ID,
      useValue: signal<string | null>(null),
    },

    provideHttpClient(withInterceptors([includeBearerTokenInterceptor, tenantInterceptor])),
    provideRouter(routes),
    provideEchartsCore({ echarts: () => import('echarts') }),
  ],
};

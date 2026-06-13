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

const urlCondition = createInterceptorCondition<IncludeBearerTokenCondition>({
  urlPattern: new RegExp(environment.apiUrl.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '.*'),
  bearerPrefix: 'Bearer',
});

import { routes } from './app.routes';
import { provideEchartsCore } from 'ngx-echarts';
import { environment } from '../environments/environment';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { tenantInterceptor } from './interceptors/tenant.interceptor';
import { ACTIVE_TENANT_ID } from './interceptors/tenant-context.token';
import { provideMarkdown } from 'ngx-markdown';

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
        redirectUri: window.location.origin + '/auth/callback',
        checkLoginIframe: false,
        scope: 'openid profile email organization:*',
        pkceMethod: 'S256',
      },
      features: [
        withAutoRefreshToken({
          onInactivityTimeout: 'logout',
          sessionTimeout: 900000,
        }),
      ],
      providers: [AutoRefreshTokenService, UserActivityService],
    }),
    {
      provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
      useValue: [urlCondition],
    },
    {
      provide: ACTIVE_TENANT_ID,
      useValue: signal<string | null>(null),
    },

    provideHttpClient(withInterceptors([includeBearerTokenInterceptor, tenantInterceptor])),
    provideRouter(routes),
    provideEchartsCore({ echarts: () => import('echarts') }),
    provideMarkdown(),
  ],
};

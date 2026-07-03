import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  signal,
} from '@angular/core';

import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import {
  provideKeycloak,
  includeBearerTokenInterceptor,
  createInterceptorCondition,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
} from 'keycloak-angular';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

import { provideEchartsCore } from 'ngx-echarts';
import { tenantInterceptor } from './interceptors/tenant.interceptor';
import { ACTIVE_TENANT_ID } from './interceptors/tenant-context.token';
import { provideMarkdown } from 'ngx-markdown';

const urlCondition = createInterceptorCondition({
  urlPattern: new RegExp(
    environment.apiUrl.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '.*'
  ),
  bearerPrefix: 'Bearer',
});

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
        pkceMethod: 'S256',
        onLoad: undefined,
        checkLoginIframe: false,
      },
    }),

    {
      provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
      useValue: [urlCondition],
    },

    {
      provide: ACTIVE_TENANT_ID,
      useValue: signal<string | null>(null),
    },

    provideHttpClient(
      withInterceptors([
        includeBearerTokenInterceptor,
        tenantInterceptor,
      ])
    ),

    provideRouter(routes),

    provideEchartsCore({ echarts: () => import('echarts') }),
    provideMarkdown(),
  ],
};
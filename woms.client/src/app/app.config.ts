import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { httpErrorHandlerInterceptor } from './shared/services/interceptors/http-error-handler.interceptor';
import { authInterceptorFn } from './shared/services/interceptors/auth.interceptor';
import { httpRequestHeaderInterceptor } from './shared/services/interceptors/http-request-header.interceptor';
import { MessageService } from 'primeng/api';
import { encryptHttpRequestInterceptor } from '@shared_services/interceptors/encrypt.interceptor';
import { DropdownStateService } from '@shared_services/state-management/dropdown-state.service';
import Aura from '@primeng/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    provideHttpClient(withFetch(),
      withInterceptors([
        httpErrorHandlerInterceptor,
        httpRequestHeaderInterceptor,
        encryptHttpRequestInterceptor,
        authInterceptorFn,
      ])),
    DropdownStateService,
    MessageService,
    provideAnimationsAsync(),
    providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } } }),
  ]
};

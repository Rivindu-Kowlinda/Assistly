import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { HttpClientModule }                      from '@angular/common/http';
import { provideRouter }                         from '@angular/router';
import { routes }                                from './app.routes';
import { provideAnimationsAsync }                from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { providePrimeNG }                        from 'primeng/config';
import Aura                                     from '@primeuix/themes/aura';

import { TokenInterceptor }                      from './interceptors/token.interceptor';
import { authValidationInterceptor }             from './interceptors/auth-validation.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),

    importProvidersFrom(HttpClientModule),

    provideHttpClient(
      withFetch(), 
      withInterceptors([ 
        authValidationInterceptor, 
        TokenInterceptor          
      ])
    ),

    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          prefix: 'p',
          darkModeSelector: false,
          cssLayer: false
        }
      }
    })
    
  ]
};
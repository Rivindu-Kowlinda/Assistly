// Fix for SockJS global issue - MUST be first line
(window as any).global = window;

// src/main.ts
import { bootstrapApplication }  from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations }     from '@angular/platform-browser/animations';

import { appConfig }             from './app/app.config';
import { App }                   from './app/app';

bootstrapApplication(App, {
  ...appConfig,
  providers: [
    ...(appConfig.providers ?? []),

    // this wires up HttpClient (and picks up any interceptors you've registered in DI)
    provideHttpClient(withInterceptorsFromDi()),

    // required by PrimeNG DialogModule & friends
    provideAnimations()
  ]
})
.catch(err => console.error(err));
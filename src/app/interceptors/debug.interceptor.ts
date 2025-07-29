// src/app/interceptors/debug.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable()
export class DebugInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    console.log(`🚀 HTTP Request: ${req.method} ${req.url}`);
    
    return next.handle(req).pipe(
      tap({
        next: (event) => {
          if (event instanceof HttpResponse) {
            console.log(`✅ HTTP Response: ${req.method} ${req.url}`, {
              status: event.status,
              body: event.body,
              headers: event.headers.keys()
            });
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(`❌ HTTP Error: ${req.method} ${req.url}`, {
            status: error.status,
            statusText: error.statusText,
            error: error.error,
            message: error.message,
            headers: error.headers?.keys()
          });
        }
      })
    );
  }
}

// Add to your app.config.ts or main.ts:
// import { HTTP_INTERCEPTORS } from '@angular/common/http';
// 
// providers: [
//   {
//     provide: HTTP_INTERCEPTORS,
//     useClass: DebugInterceptor,
//     multi: true
//   }
// ]
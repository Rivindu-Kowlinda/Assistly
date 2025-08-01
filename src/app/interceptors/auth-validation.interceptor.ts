// src/app/interceptors/auth-validation.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { JwtValidationService } from '../services/jwt-validation.service';

export const authValidationInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const jwtValidation = inject(JwtValidationService);

  // Skip validation for login requests
  if (req.url.includes('/auth/login')) {
    return next(req);
  }

  // Validate token before making the request
  const token = localStorage.getItem('token');
  if (token && !jwtValidation.validateCurrentToken()) {
    console.warn('Invalid token detected before request, clearing auth');
    localStorage.clear();
    router.navigate(['/login']);
    return throwError(() => new Error('Invalid token'));
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized responses (token expired on server)
      if (error.status === 401) {
        console.warn('Server returned 401, token may be expired');
        localStorage.clear();
        router.navigate(['/login']);
        // Note: Notification will be handled by JWT validation service
      }
      
      return throwError(() => error);
    })
  );
};
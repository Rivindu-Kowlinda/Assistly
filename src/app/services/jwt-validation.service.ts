// src/app/services/jwt-validation.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class JwtValidationService {
  private originalToken: string | null = null;
  private isLoggingOut = false; // Prevent multiple logout attempts

  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.startTokenMonitoring();
  }

  // Check if JWT token format is valid (basic structure check)
  isValidJwtFormat(token: string): boolean {
    if (!token) return false;
    
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    try {
      // Try to decode the header and payload to check if they're valid base64
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      
      // Basic JWT structure validation
      return header && payload && typeof header === 'object' && typeof payload === 'object';
    } catch (error) {
      return false;
    }
  }

  // Check if JWT token is expired
  isTokenExpired(token: string): boolean {
    if (!this.isValidJwtFormat(token)) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Check if token has expiration time and if it's expired
      return payload.exp && payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  // Validate current token in localStorage
  validateCurrentToken(): boolean {
    if (this.isLoggingOut) return false; // Prevent validation during logout
    
    const currentToken = localStorage.getItem('token');
    
    if (!currentToken) {
      return false;
    }
    
    if (!this.isValidJwtFormat(currentToken)) {
      console.warn('Invalid JWT format detected');
      return false;
    }
    
    if (this.isTokenExpired(currentToken)) {
      console.warn('JWT token has expired');
      return false;
    }
    
    return true;
  }

  // Set the original token for monitoring
  setOriginalToken(token: string): void {
    this.originalToken = token;
    this.isLoggingOut = false; // Reset logout flag when setting new token
  }

  // Check if token was tampered with
  isTokenTampered(): boolean {
    if (this.isLoggingOut) return false;
    
    const currentToken = localStorage.getItem('token');
    
    if (this.originalToken && currentToken !== this.originalToken) {
      console.warn('JWT token has been tampered with');
      return true;
    }
    
    return false;
  }

  // Start monitoring localStorage for token changes
  private startTokenMonitoring(): void {
    // Monitor localStorage changes
    window.addEventListener('storage', (event) => {
      if (this.isLoggingOut) return;
      
      if (event.key === 'token') {
        if (!event.newValue || !this.isValidJwtFormat(event.newValue)) {
          console.warn('Token removed or invalidated, logging out');
          this.handleInvalidToken('Token was removed or modified');
        }
      }
    });

    // Periodically check token validity (every 30 seconds)
    setInterval(() => {
      if (!this.isLoggingOut) {
        this.checkTokenValidity();
      }
    }, 30000);

    // Check token on focus (when user returns to tab)
    window.addEventListener('focus', () => {
      if (!this.isLoggingOut) {
        this.checkTokenValidity();
      }
    });
  }

  // Check token validity and handle invalid tokens
  private checkTokenValidity(): void {
    if (this.isLoggingOut) return;
    
    const currentToken = localStorage.getItem('token');
    
    if (!currentToken) {
      this.handleInvalidToken('Session expired');
      return;
    }

    if (!this.validateCurrentToken()) {
      this.handleInvalidToken('Invalid or expired token');
      return;
    }

    if (this.isTokenTampered()) {
      this.handleInvalidToken('Token has been tampered with');
      return;
    }
  }

  // Handle invalid token by clearing auth data and redirecting
  private handleInvalidToken(reason: string): void {
    if (this.isLoggingOut) return; // Prevent multiple logout attempts
    
    this.isLoggingOut = true;
    console.warn('Invalid token detected:', reason);
    
    // Clear auth data
    localStorage.clear();
    
    // Show notification
    this.notificationService.showNotification(
      'Your session has expired or been tampered with. Please log in again.',
      'warning',
      4000
    );
    
    // Navigate to login after a short delay to allow notification to show
    setTimeout(() => {
      this.router.navigate(['/login']).then(() => {
        this.isLoggingOut = false; // Reset flag after navigation
      });
    }, 500);
  }

  // Reset logout flag (call this when user successfully logs in)
  resetLogoutFlag(): void {
    this.isLoggingOut = false;
  }
}
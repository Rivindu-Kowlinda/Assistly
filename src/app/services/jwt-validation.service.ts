import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class JwtValidationService {
  private originalToken: string | null = null;
  private originalRole: string | null = null;
  private isLoggingOut = false;
  private isMonitoring = true;
  private checkIntervalId: any = null;

  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.startTokenMonitoring();
  }

  validateCurrentToken(): boolean {
    if (this.isLoggingOut) return false;

    const token = localStorage.getItem('token');
    if (!token) return false;

    if (!this.isValidJwtFormat(token)) return false;
    if (this.isTokenExpired(token)) return false;

    return true;
  }

  isValidJwtFormat(token: string): boolean {
    if (!token) return false;

    const parts = token.split('.');
    if (parts.length !== 3) return false;

    try {
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      return header && payload && typeof header === 'object' && typeof payload === 'object';
    } catch {
      return false;
    }
  }

  isTokenExpired(token: string): boolean {
    if (!this.isValidJwtFormat(token)) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp && payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  isTokenTampered(): boolean {
    if (this.isLoggingOut) return false;
    const currentToken = localStorage.getItem('token');
    return this.originalToken !== null && currentToken !== this.originalToken;
  }

  isRoleTampered(): boolean {
    if (this.isLoggingOut) return false;
    const currentRole = localStorage.getItem('role');
    return this.originalRole !== null && currentRole !== this.originalRole;
  }

  setOriginalToken(token: string): void {
    this.originalToken = token;
    this.originalRole = localStorage.getItem('role');
    this.isLoggingOut = false;
    this.isMonitoring = true;
  }

  resetLogoutFlag(): void {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token && role) {
      this.originalToken = token;
      this.originalRole = role;
      this.isLoggingOut = false;
      this.isMonitoring = true;
      this.startTokenMonitoring();
    }
  }

  private checkTokenValidity(): void {
    if (this.isLoggingOut || !this.isMonitoring) return;

    const token = localStorage.getItem('token');
    if (!token) {
      this.handleInvalidToken('expired');
      return;
    }

    if (!this.validateCurrentToken()) {
      this.handleInvalidToken('expired');
      return;
    }

    if (this.isTokenTampered()) {
      this.handleInvalidToken('tampered-token');
      return;
    }

    if (this.isRoleTampered()) {
      this.handleInvalidToken('tampered-role');
      return;
    }
  }

  private handleInvalidToken(reason: 'expired' | 'tampered-token' | 'tampered-role'): void {
    if (this.isLoggingOut) return;

    this.isLoggingOut = true;
    this.originalToken = null;
    this.originalRole = null;
    this.isMonitoring = false;

    // Remove auth-related data
    localStorage.removeItem('token');
    localStorage.removeItem('role');

    let message = 'Your session has expired or been tampered with. Please log in again.';

    if (reason === 'expired') {
      message = 'Your session has expired. Please log in again.';
    } else if (reason === 'tampered-token') {
      message = 'Your authentication token was tampered with. You have been logged out.';
    } else if (reason === 'tampered-role') {
      message = 'Your role information has been modified or removed. Please log in again.';
    }

    this.notificationService.showNotification(
      message,
      'warning',
      4000
    );

    setTimeout(() => {
      this.router.navigate(['/login']).then(() => {
        this.isLoggingOut = false;
      });
    }, 500);

    this.stopTokenMonitoring();
  }

  private startTokenMonitoring(): void {
    this.stopTokenMonitoring();

    window.addEventListener('storage', this.onStorageChange);
    window.addEventListener('focus', this.onFocus);

    this.checkIntervalId = setInterval(() => {
      this.checkTokenValidity();
    }, 30000);
  }

  private stopTokenMonitoring(): void {
    if (this.checkIntervalId !== null) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
    }

    window.removeEventListener('storage', this.onStorageChange);
    window.removeEventListener('focus', this.onFocus);
  }

  private onStorageChange = (event: StorageEvent): void => {
    if (this.isLoggingOut || !this.isMonitoring) return;

    if (event.key === 'token' && (!event.newValue || !this.isValidJwtFormat(event.newValue))) {
      this.handleInvalidToken('tampered-token');
    }

    if (event.key === 'role' && event.newValue !== this.originalRole) {
      this.handleInvalidToken('tampered-role');
    }
  };

  private onFocus = (): void => {
    if (this.isLoggingOut || !this.isMonitoring) return;
    this.checkTokenValidity();
  };
}

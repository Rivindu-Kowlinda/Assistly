import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { JwtValidationService } from './jwt-validation.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/auth';
  private userRole = new BehaviorSubject<string | null>(this.getRole());

  constructor(
    private http: HttpClient,
    private router: Router,
    private jwtValidation: JwtValidationService
  ) {}

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, credentials).pipe(
      tap(response => {
        // Save token and role
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role[0]);
        this.userRole.next(response.role[0]);

        // ✅ Restart token monitoring (single clean call)
        this.jwtValidation.resetLogoutFlag();
      })
    );
  }

  logout(): void {
    localStorage.clear();
    this.userRole.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return this.jwtValidation.validateCurrentToken();
  }

  getUserRoleObservable(): Observable<string | null> {
    return this.userRole.asObservable();
  }

  getRoleOrEmpty(): string {
    return this.getRole() || '';
  }

  hasRole(role: string): boolean {
    if (!this.isLoggedIn()) return false;
    const userRole = this.getRole();
    return userRole === role;
  }

  hasAnyRole(roles: string[]): boolean {
    if (!this.isLoggedIn()) return false;
    const userRole = this.getRole();
    return userRole ? roles.includes(userRole) : false;
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isEmployee(): boolean {
    return this.hasAnyRole(['JUNIOR', 'MID', 'SENIOR']);
  }

  setRole(role: string): void {
    localStorage.setItem('role', role);
    this.userRole.next(role);
  }

  validateSession(): boolean {
    return this.jwtValidation.validateCurrentToken();
  }
}

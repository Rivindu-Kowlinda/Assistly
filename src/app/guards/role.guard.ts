import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    console.log('RoleGuard: Checking route:', route.routeConfig?.path);
    
    // Check if user is logged in first
    if (!this.auth.isLoggedIn()) {
      console.log('RoleGuard: User not logged in, redirecting to login');
      this.router.navigate(['/login']);
      return false;
    }

    const expectedRole = route.data['expectedRole'];
    const actualRole = this.auth.getRole();
    
    console.log('RoleGuard: Expected role:', expectedRole);
    console.log('RoleGuard: Actual role:', actualRole);
    
    // Handle case where no role is specified
    if (!expectedRole) {
      console.log('RoleGuard: No expected role specified, allowing access');
      return true;
    }

    // Use helper methods to safely check roles
    const isAuthorized = Array.isArray(expectedRole)
      ? this.auth.hasAnyRole(expectedRole)
      : this.auth.hasRole(expectedRole);

    console.log('RoleGuard: Is authorized:', isAuthorized);

    if (!isAuthorized) {
      console.log('RoleGuard: User not authorized, redirecting to unauthorized');
      // Pass the attempted URL as a query parameter
      const attemptedUrl = route.routeConfig?.path || '';
      this.router.navigate(['/unauthorized'], { 
        queryParams: { returnUrl: attemptedUrl } 
      });
      return false;
    }

    console.log('RoleGuard: Access granted');
    return true;
  }
}
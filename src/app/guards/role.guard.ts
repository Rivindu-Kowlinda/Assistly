import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const routePath = route.routeConfig?.path || 'Unknown';
    console.log('RoleGuard: Checking route:', routePath);

    const token = this.auth.getToken();
    const isValidSession = this.auth.validateSession();

    if (!token || !isValidSession) {
      console.warn('RoleGuard: No valid token/session, redirecting to login');
      this.router.navigate(['/login']);
      return false;
    }

    const expectedRole = route.data['expectedRole'];
    const actualRole = this.auth.getRole();

    console.log('RoleGuard: Expected role:', expectedRole);
    console.log('RoleGuard: Actual role:', actualRole);

    if (!actualRole) {
      console.warn('RoleGuard: No user role found, redirecting to login');
      this.router.navigate(['/login']);
      return false;
    }

    const isAuthorized = Array.isArray(expectedRole)
      ? this.auth.hasAnyRole(expectedRole)
      : this.auth.hasRole(expectedRole);

    console.log('RoleGuard: Is authorized:', isAuthorized);

    if (!isAuthorized) {
      console.warn('RoleGuard: User not authorized, redirecting to unauthorized');
      this.router.navigate(['/unauthorized'], {
        queryParams: { returnUrl: routePath }
      });
      return false;
    }

    console.log('RoleGuard: Access granted');
    return true;
  }
}

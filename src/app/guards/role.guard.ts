import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data['expectedRole'];
    const actualRole = this.auth.getRole();

    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    const isAuthorized = Array.isArray(expectedRole)
      ? expectedRole.includes(actualRole)
      : actualRole === expectedRole;

    if (!isAuthorized) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  }
}

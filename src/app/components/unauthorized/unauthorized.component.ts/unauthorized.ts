// unauthorized.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  templateUrl: './unauthorized.html',
  styleUrl: './unauthorized.css',
})
export class UnauthorizedComponent implements OnInit {
  private returnUrl: string = '/login';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Try to get the return URL from query params
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/login';
  }

  goBack(): void {
    // Use Angular's Location service for better back navigation
    this.location.back();
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToDashboard(): void {
    // Use helper methods for cleaner code
    if (this.authService.isAdmin()) {
      this.router.navigate(['/adminDashboard']);
    } else if (this.authService.isEmployee()) {
      this.router.navigate(['/employeeDashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
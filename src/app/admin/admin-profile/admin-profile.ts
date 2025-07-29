import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { AdminSidebar }      from '../../components/admin-sidebar/admin-sidebar';
import { ButtonModule }      from 'primeng/button';
import { Router }            from '@angular/router';

import { UserService, UserProfile } from '../../services/user.admin.service';

@Component({
  selector: 'admin-profile',
  standalone: true,
  imports: [CommonModule, AdminSidebar, ButtonModule],
  templateUrl: './admin-profile.html',
  styleUrls: ['./admin-profile.css']
})
export class AdminProfile implements OnInit {
  user: UserProfile | null = null;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: data => this.user = data,
      error: err => console.error('Error loading admin profile:', err)
    });
  }

  isAdmin(): boolean {
    return this.user?.role?.includes('ADMIN') ?? false;
  }

  logout() {
    // clear JWT/token
    localStorage.removeItem('token');
    localStorage.removeItem('jwt');
    // navigate to login
    this.router.navigate(['/login']);
  }
}

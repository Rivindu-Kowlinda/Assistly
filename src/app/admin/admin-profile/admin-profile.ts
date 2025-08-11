import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { AdminSidebar }      from '../../components/admin-sidebar/admin-sidebar';
import { ButtonModule }      from 'primeng/button';
import { TagModule }         from 'primeng/tag';
import { Router }            from '@angular/router';

import { UserService, UserProfile } from '../../services/user.admin.service';

@Component({
  selector: 'admin-profile',
  standalone: true,
  imports: [CommonModule, AdminSidebar, ButtonModule, TagModule],
  templateUrl: './admin-profile.html',
  styleUrls: ['./admin-profile.css']
})
export class AdminProfile implements OnInit {
  user: UserProfile | null = null;
  roleLabelMap: Record<string, string> = {
    'ADMIN':  'Admin',
    'JUNIOR': 'Junior',
    'MID':    'Mid-Level',
    'SENIOR': 'Senior'
  };

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

  getRoleLabel(role: string): string {
    return this.roleLabelMap[role] || role;
  }

  getRoleSeverity(role: string): string {
    switch (role) {
      case 'JUNIOR': return 'info';
      case 'MID':    return 'warning';
      case 'SENIOR': return 'success';
      case 'ADMIN':  return 'danger';
      default:       return 'secondary';
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('jwt');
    this.router.navigate(['/login']);
  }
}

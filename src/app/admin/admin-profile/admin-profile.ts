import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminSidebar } from '../../components/admin-sidebar/admin-sidebar';
import { UserService, UserProfile } from '../../services/user.admin.service';

@Component({
  selector: 'admin-profile',
  standalone: true,
  imports: [CommonModule, AdminSidebar],
  templateUrl: './admin-profile.html',
  styleUrl: './admin-profile.css'
})
export class AdminProfile implements OnInit {
  user: UserProfile | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: (data) => this.user = data,
      error: (err) => console.error('Error loading admin profile:', err)
    });
  }

  isAdmin(): boolean {
    return this.user?.role?.includes('ADMIN') ?? false;
  }
}

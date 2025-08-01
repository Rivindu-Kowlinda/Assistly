import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { Sidebar }           from '../../components/sidebar/sidebar';
import { ButtonModule }      from 'primeng/button';
import { Router }            from '@angular/router';
import { UserService }       from '../../services/proflile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, Sidebar, ButtonModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {
  user = {
    username: '',
    role: '',
    balancePoints: 0,
    monthlyAllocation: 0,
    requestCount: 0,
    helpPending: 0,
    helpCompleted: 0
  };

  // Role mapping from enum to readable labels
  roleMap: { [key: string]: string } = {
    ADMIN:  'Admin',
    JUNIOR: 'Junior',
    MID:    'Mid',
    SENIOR: 'Senior'
  };

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: data => {
        this.user = {
          username:          data.username,
          role:              this.roleMap[data.role[0]] || data.role[0], // map first role to label
          balancePoints:     data.balancePoints,
          monthlyAllocation: data.monthlyAllocation,
          requestCount:      data.requestCount,
          helpPending:       data.helpPendingCount,
          helpCompleted:     data.helpAcceptedCount
        };
      },
      error: err => {
        console.error('Failed to load profile data', err);
      }
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('jwt');
    localStorage.removeItem('role');
    this.router.navigate(['/login']);
  }

  getFirstLetter(username: string): string {
    return username ? username.charAt(0).toUpperCase() : '';
  }
}

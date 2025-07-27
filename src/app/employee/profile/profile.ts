import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../components/sidebar/sidebar';
import { UserService } from '../../services/proflile.service'; // update path as needed

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, Sidebar],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
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

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: (data) => {
        this.user = {
          username: data.username,
          role: data.role[0], // assume first role only
          balancePoints: data.balancePoints,
          monthlyAllocation: data.monthlyAllocation,
          requestCount: data.requestCount,
          helpPending: data.helpPendingCount,
          helpCompleted: data.helpAcceptedCount
        };
      },
      error: (err) => {
        console.error('Failed to load profile data', err);
      }
    });
  }
}

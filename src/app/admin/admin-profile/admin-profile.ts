import { Component } from '@angular/core';

import { Sidebar } from '../../components/sidebar/sidebar';
import { AdminSidebar } from '../../components/admin-sidebar/admin-sidebar';

@Component({
  selector: 'admin-profile',
  imports: [AdminSidebar],
  templateUrl: './admin-profile.html',
  styleUrl: './admin-profile.css'
})
export class AdminProfile {
  user = {
    username: 'rivindu_k',
    role: 'admin apparently',
    balancePoints: 1200,
    monthlyAllocation: 500,
    requestCount: 32,
    helpPending: 4,
    helpCompleted: 28,
  };
}
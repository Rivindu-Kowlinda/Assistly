import { Component } from '@angular/core';

import { Sidebar } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-profile',
  imports: [Sidebar],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {
  user = {
    username: 'rivindu_k',
    role: 'no dev',
    balancePoints: 1200,
    monthlyAllocation: 500,
    requestCount: 32,
    helpPending: 4,
    helpCompleted: 28,
  };
}
import { Component, OnInit } from '@angular/core';
import { HelpService } from '../../services/help.service';
import { HelpRequest } from '../models/help-request.model';

import { CommonModule } from '@angular/common';
import { Sidebar } from '../../components/sidebar/sidebar';
import { Popup } from '../../components/popup/popup';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, Sidebar, Popup],
  templateUrl: './help.html',
  styleUrl: './help.css'
})
export class Help implements OnInit {
  requests: HelpRequest[] = [];

  constructor(private helpService: HelpService) {}

  ngOnInit(): void {
    this.helpService.getReceivedRequests().subscribe({
      next: (res) => {
        console.log('✅ Help Requests:', res);
        this.requests = res;
      },
      error: (err) => {
        console.error('❌ Failed to fetch help requests:', err);
      }
    });
  }
}

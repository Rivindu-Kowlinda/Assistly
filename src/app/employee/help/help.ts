// src/app/components/help/help.component.ts
import { Component, OnInit } from '@angular/core';
import { HelpService } from '../../services/help.service';
import { HelpRequest } from '../models/help-request.model';

import { CommonModule } from '@angular/common';
import { Sidebar } from '../../components/sidebar/sidebar';
import { Popup } from '../../components/popup/popup';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [
    CommonModule,
    Sidebar,
    Popup
  ],
  templateUrl: './help.html',
  styleUrls: ['./help.css']
})
export class Help implements OnInit {
  requests: HelpRequest[] = [];
  selectedRequestId: string | null = null;

  constructor(private helpService: HelpService) {
    console.log('🏗️ Help component constructor');
    console.log('🔧 HelpService injected:', !!this.helpService);
    console.log('📋 HelpService type:', typeof this.helpService);
    console.log('🔍 HelpService methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(this.helpService)));
  }

  ngOnInit(): void {
    console.log('🚀 Help component ngOnInit started');
    
    try {
      console.log('📞 Calling helpService.getReceivedRequests()...');

      this.helpService.getReceivedRequests().subscribe({
        next: (res) => {
          console.log('✅ Help component received data:', res);
          // Filter out any completed requests
          this.requests = (res || [])
            .filter(req => req.status.toLowerCase() !== 'completed');
          console.log('💾 Component requests after filtering:', this.requests);
        },
        error: (err) => {
          console.error('❌ Help component subscription error:', err);
          console.error('📋 Error type:', typeof err);
          console.error('🔍 Error properties:', Object.keys(err));
        },
        complete: () => {
          console.log('✅ Help component subscription completed');
        }
      });
      
    } catch (error) {
      console.error('💥 Exception in ngOnInit:', error);
    }
  }

  openChat(requestId: string): void {
    console.log('💬 Opening chat for request:', requestId);
    this.selectedRequestId = requestId;
  }

  // Map enum values to human-readable text
  getStatusText(status: any): string {
    const statusMap: { [key: string]: string } = {
      // Numeric enum values
      '0': 'Pending',
      '1': 'In Progress', 
      '2': 'Completed',
      '3': 'Cancelled',
      '4': 'On Hold',
      // String enum values (uppercase)
      'PENDING': 'Pending',
      'IN_PROGRESS': 'In Progress',
      'COMPLETED': 'Completed', 
      'CANCELLED': 'Cancelled',
      'ON_HOLD': 'On Hold',
      // String enum values (lowercase)
      'pending': 'Pending',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'on_hold': 'On Hold',
      // Mixed case variations
      'in-progress': 'In Progress',
      'on-hold': 'On Hold'
    };
    
    // Convert to string and check map
    const statusStr = String(status);
    return statusMap[statusStr] || statusStr;
  }

  // Map enum values to CSS class names
  getStatusClass(status: any): string {
    const classMap: { [key: string]: string } = {
      // Numeric enum values
      '0': 'pending',
      '1': 'in-progress', 
      '2': 'completed',
      '3': 'cancelled',
      '4': 'on-hold',
      // String enum values (uppercase)
      'PENDING': 'pending',
      'IN_PROGRESS': 'in-progress',
      'COMPLETED': 'completed',
      'CANCELLED': 'cancelled', 
      'ON_HOLD': 'on-hold',
      // String enum values (lowercase)
      'pending': 'pending',
      'in_progress': 'in-progress',
      'completed': 'completed',
      'cancelled': 'cancelled',
      'on_hold': 'on-hold',
      // Mixed case variations
      'in-progress': 'in-progress',
      'on-hold': 'on-hold'
    };
    
    // Convert to string and check map, default to 'pending'
    const statusStr = String(status);
    return classMap[statusStr] || 'pending';
  }
}
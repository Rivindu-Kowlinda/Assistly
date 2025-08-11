import { Component, OnInit } from '@angular/core';
import { HelpService } from '../../services/help.service';
import { HelpRequest } from '../models/help-request.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../components/sidebar/sidebar';
import { Popup } from '../../components/popup/popup';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Sidebar,
    Popup
  ],
  templateUrl: './help.html',
  styleUrls: ['./help.css']
})
export class Help implements OnInit {
  requests: HelpRequest[] = [];
  filteredRequests: HelpRequest[] = [];
  selectedRequestId: string | null = null;
  searchTerm: string = '';

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
          this.requests = (res || [])
            .filter(req => req.status.toLowerCase() !== 'completed')
            .sort((a, b) => {
              const dateA = new Date(a.createdAt).getTime();
              const dateB = new Date(b.createdAt).getTime();
              return dateA - dateB;
            });
          this.filteredRequests = [...this.requests];
          console.log('💾 Component requests after filtering and sorting:', this.requests);
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

  onSearchChange(): void {
    if (!this.searchTerm.trim()) {
      this.filteredRequests = [...this.requests];
    } else {
      const searchLower = this.searchTerm.toLowerCase().trim();
      this.filteredRequests = this.requests.filter(req => 
        req.heading?.toLowerCase().includes(searchLower) ||
        req.requestName?.toLowerCase().includes(searchLower)
      );
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredRequests = [...this.requests];
  }

  openChat(requestId: string): void {
    console.log('💬 Opening chat for request:', requestId);
    this.selectedRequestId = requestId;
  }

  getStatusText(status: any): string {
    const statusMap: { [key: string]: string } = {
      '0': 'Pending',
      '1': 'In Progress', 
      '2': 'Completed',
      '3': 'Cancelled',
      '4': 'On Hold',
      'PENDING': 'Pending',
      'IN_PROGRESS': 'In Progress',
      'COMPLETED': 'Completed', 
      'CANCELLED': 'Cancelled',
      'ON_HOLD': 'On Hold',
      'pending': 'Pending',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'on_hold': 'On Hold',
      'in-progress': 'In Progress',
      'on-hold': 'On Hold'
    };
    const statusStr = String(status);
    return statusMap[statusStr] || statusStr;
  }

  getStatusClass(status: any): string {
    const classMap: { [key: string]: string } = {
      '0': 'pending',
      '1': 'in-progress', 
      '2': 'completed',
      '3': 'cancelled',
      '4': 'on-hold',
      'PENDING': 'pending',
      'IN_PROGRESS': 'in-progress',
      'COMPLETED': 'completed',
      'CANCELLED': 'cancelled', 
      'ON_HOLD': 'on-hold',
      'pending': 'pending',
      'in_progress': 'in-progress',
      'completed': 'completed',
      'cancelled': 'cancelled',
      'on_hold': 'on-hold',
      'in-progress': 'in-progress',
      'on-hold': 'on-hold'
    };
    const statusStr = String(status);
    return classMap[statusStr] || 'pending';
  }
}

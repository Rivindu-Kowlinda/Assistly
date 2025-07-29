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
}

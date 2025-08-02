// src/app/components/popup/popup.component.ts
import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  OnDestroy,
  Injector
} from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { ChatService, ChatMessage } from '../../services/chat.service';
import { HelpRequest } from '../../employee/models/help-request.model';
import { HelpRequestService } from '../../services/help-request.service';

interface UIMessage {
  id: string;
  type: 'text' | 'system';
  sender: 'me' | 'them' | 'system';
  senderName: string;
  avatar: string;
  text: string;
  images?: string[];
  timestamp: Date;
}

@Component({
  selector: 'popup',
  standalone: true,
  templateUrl: './popup.html',
  styleUrls: ['./popup.css'],
  imports: [
    DialogModule,
    ButtonModule,
    InputTextModule,
    AvatarModule,
    FormsModule,
    CommonModule
  ]
})
export class Popup implements AfterViewChecked, OnDestroy {
  @Input() request!: HelpRequest;
  @ViewChild('chatScroll') chatScroll!: ElementRef;

  visible = false;
  chatAccepted = false;
  newMessage = '';
  messages: UIMessage[] = [];
  initialized = false;
  loading = false;
  error: string | null = null;

  private sub?: Subscription;
  private needScroll = false;
  private currentUserId: string = '';

  private chatService?: ChatService;
  private reqService?: HelpRequestService;

  // Status mapping for better display
  private readonly statusMap: { [key: string]: string } = {
    'PENDING': 'Pending',
    'IN_PROGRESS': 'In Progress'
  };

  constructor(private injector: Injector) {}

  private getServices() {
    if (!this.chatService) this.chatService = this.injector.get(ChatService);
    if (!this.reqService) this.reqService = this.injector.get(HelpRequestService);
  }

  // Helper method to get current user ID with multiple fallback strategies
  private getCurrentUserId(): string {
    // Strategy 1: Try the service method
    try {
      if (this.reqService) {
        const serviceUserId = this.reqService.currentUserId();
        if (serviceUserId && serviceUserId.trim() !== '') {
          console.log('Got user ID from service:', serviceUserId);
          return serviceUserId;
        }
      }
    } catch (error) {
      console.warn('Failed to get user ID from service:', error);
    }

    // Strategy 2: Try localStorage
    try {
      const storedUserId = localStorage.getItem('userId') || localStorage.getItem('currentUserId') || localStorage.getItem('user_id');
      if (storedUserId && storedUserId.trim() !== '') {
        console.log('Got user ID from localStorage:', storedUserId);
        return storedUserId;
      }
    } catch (error) {
      console.warn('Failed to get user ID from localStorage:', error);
    }

    // Strategy 3: Try sessionStorage
    try {
      const sessionUserId = sessionStorage.getItem('userId') || sessionStorage.getItem('currentUserId') || sessionStorage.getItem('user_id');
      if (sessionUserId && sessionUserId.trim() !== '') {
        console.log('Got user ID from sessionStorage:', sessionUserId);
        return sessionUserId;
      }
    } catch (error) {
      console.warn('Failed to get user ID from sessionStorage:', error);
    }

    // Strategy 4: Try to extract from JWT token
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('jwt');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const tokenUserId = payload.userId || payload.sub || payload.id || payload.user_id;
        if (tokenUserId && tokenUserId.trim() !== '') {
          console.log('Got user ID from JWT token:', tokenUserId);
          return tokenUserId;
        }
      }
    } catch (error) {
      console.warn('Failed to get user ID from JWT token:', error);
    }

    console.error('Could not determine current user ID using any strategy');
    return '';
  }

  // Public getter methods for template access
  get displayStatus(): string {
    return this.statusMap[this.request?.status] || this.request?.status || 'Unknown';
  }

  // Get CSS class for status styling
  get statusCssClass(): string {
    return 'status-' + (this.request?.status?.toLowerCase() || 'unknown');
  }

  showDialog(): void {
    this.visible = true;
    if (!this.initialized) {
      this.initialize();
      this.initialized = true;
    }
  }

  // Helper method to process message content and extract images
  processMessageContent(content: string): { text: string; images: string[] } {
    if (!content) return { text: '', images: [] };
    
    const imgRegex = /<img[^>]*src="([^"]*)"[^>]*>/g;
    const images: string[] = [];
    let match;
    
    // Extract all image URLs
    while ((match = imgRegex.exec(content)) !== null) {
      images.push(match[1]);
    }
    
    // Remove HTML img tags and return clean text
    const text = content.replace(/<img[^>]*>/g, '').trim();
    
    return { text, images };
  }

  private async initialize() {
    this.loading = true;
    this.error = null;
    
    try {
      this.getServices();
      
      // Get current user ID with extensive debugging
      this.currentUserId = this.getCurrentUserId();
      
      console.log('=== USER ID DEBUG ===');
      console.log('Final currentUserId:', `"${this.currentUserId}"`);
      console.log('currentUserId length:', this.currentUserId.length);
      console.log('currentUserId type:', typeof this.currentUserId);
      console.log('isEmpty:', this.currentUserId === '');
      console.log('====================');
      
      if (!this.currentUserId || this.currentUserId.trim() === '') {
        this.error = 'Unable to identify current user. Please log in again.';
        console.error('CRITICAL: currentUserId is empty after all strategies');
        return;
      }
      
      this.chatAccepted = this.request.status === 'IN_PROGRESS';

      // Load chat history with improved error handling
      const history = await this.reqService!.getChatHistory(this.request.id);
      
      console.log('Chat history loaded:', history);
      
      if (history && history.length > 0) {
        this.messages = history.map(m => this.toUI(m));
        this.scrollToBottom();
      } else {
        // Add a system message if no history exists
        this.messages = [{
          id: 'sys-init-' + Date.now(),
          type: 'system',
          sender: 'system',
          senderName: 'System',
          avatar: '',
          text: 'Chat initialized',
          timestamp: new Date()
        }];
      }

      // Subscribe to new messages
      this.sub = this.chatService!
        .onMessage(this.request.id)
        .subscribe({
          next: (m) => {
            console.log('New message received:', m);
            this.messages.push(this.toUI(m));
            this.scrollToBottom();
          },
          error: (error) => {
            console.error('Error receiving messages:', error);
            this.error = 'Failed to receive messages';
          }
        });

    } catch (error) {
      console.error('Failed to initialize chat:', error);
      this.error = 'Failed to load chat history';
      
      // Still allow the chat to work with empty history
      this.messages = [{
        id: 'sys-error-' + Date.now(),
        type: 'system',
        sender: 'system',
        senderName: 'System',
        avatar: '',
        text: 'Chat loaded (history unavailable)',
        timestamp: new Date()
      }];
    } finally {
      this.loading = false;
    }
  }

  async acceptChat(): Promise<void> {
    try {
      this.loading = true;
      this.error = null;
      
      // Ensure we have a valid user ID before accepting
      if (!this.currentUserId || this.currentUserId.trim() === '') {
        this.currentUserId = this.getCurrentUserId();
        if (!this.currentUserId || this.currentUserId.trim() === '') {
          this.error = 'Unable to identify current user. Please refresh the page.';
          return;
        }
      }
      
      const updated = await this.reqService!.acceptRequest(this.request.id);
      
      this.chatAccepted = true;
      this.request.status = updated.status;
      
      this.messages.push({
        id: 'sys-' + Date.now(),
        type: 'system',
        sender: 'system',
        senderName: 'System',
        avatar: '',
        text: 'You joined the chat',
        timestamp: new Date()
      });
      
      this.scrollToBottom();
      
    } catch (error) {
      console.error('Failed to accept chat:', error);
      this.error = 'Failed to accept chat request';
    } finally {
      this.loading = false;
    }
  }

  async sendMessage(): Promise<void> {
    const txt = this.newMessage.trim();
    if (!txt || !this.chatAccepted) return;

    // Validate user ID before sending
    if (!this.currentUserId || this.currentUserId.trim() === '') {
      console.error('SEND MESSAGE ERROR: currentUserId is empty');
      console.log('Attempting to re-fetch user ID...');
      
      this.currentUserId = this.getCurrentUserId();
      
      if (!this.currentUserId || this.currentUserId.trim() === '') {
        this.error = 'Unable to identify current user. Please refresh the page and try again.';
        console.error('CRITICAL: Still no user ID after re-fetch attempt');
        return;
      }
    }

    try {
      console.log('=== SENDING MESSAGE DEBUG ===');
      console.log('senderId:', `"${this.currentUserId}"`);
      console.log('requestId:', this.request.id);
      console.log('content:', txt);
      console.log('============================');

      const msg: ChatMessage = {
        requestId: this.request.id,
        senderId: this.currentUserId,
        content: txt,
        timestamp: new Date().toISOString()
      };

      console.log('Complete message object:', msg);

      await this.chatService!.sendMessage(msg);
      this.newMessage = '';
      this.error = null;
      
    } catch (error) {
      console.error('Failed to send message:', error);
      this.error = 'Failed to send message';
    }
  }

  private toUI(m: ChatMessage): UIMessage {
    const me = m.senderId === this.currentUserId;
    const processed = this.processMessageContent(m.content);
    
    return {
      id: m.id ?? `msg-${Date.now()}-${Math.random()}`,
      type: 'text',
      sender: me ? 'me' : 'them',
      senderName: me ? 'You' : 'Helper',
      avatar: '',
      text: processed.text,
      images: processed.images,
      timestamp: new Date(m.timestamp)
    };
  }

  ngAfterViewChecked(): void {
    if (this.needScroll) {
      this.scrollToBottom();
      this.needScroll = false;
    }
  }

  private scrollToBottom(): void {
    try {
      this.needScroll = true;
      setTimeout(() => {
        if (this.chatScroll?.nativeElement) {
          const el = this.chatScroll.nativeElement;
          el.scrollTop = el.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.warn('Failed to scroll to bottom:', error);
    }
  }

  onInputKeydown(ev: KeyboardEvent): void {
    if (ev.key === 'Enter' && !ev.shiftKey && this.chatAccepted) {
      ev.preventDefault();
      this.sendMessage();
    }
  }

  trackByMessageId(_: number, m: UIMessage): string {
    return m.id;
  }

  clearError(): void {
    this.error = null;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
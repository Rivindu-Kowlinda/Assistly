// src/app/components/response-popup/popup.component.ts

import {
  Component, Input, ViewChild, ElementRef,
  AfterViewChecked, OnDestroy, Injector, Output, EventEmitter
} from '@angular/core';
import { DialogModule }   from 'primeng/dialog';
import { ButtonModule }   from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule }   from 'primeng/avatar';
import { RatingModule }   from 'primeng/rating';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { Subscription }   from 'rxjs';

import { ChatService, ChatMessage }       from '../../services/chat.service';
import { HelpRequestService }             from '../../services/help-request.service';

interface UIMessage {
  /** Unique identifier for tracking */
  id: string;
  type: 'text' | 'system';
  sender: 'me' | 'them' | 'system';
  senderName: string;
  text: string;
  images?: string[];
  timestamp: Date;
}

@Component({
  selector: 'popup',
  standalone: true,
  imports: [
    DialogModule,
    ButtonModule,
    InputTextModule,
    AvatarModule,
    RatingModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './response-popup.html',
  styleUrls: ['./response-popup.css']
})
export class Popup implements AfterViewChecked, OnDestroy {
  @Input() requestId!: string;
  @Input() itemType: 'Request' | 'Help' = 'Request'; // New input to distinguish type
  @Input() existingRating?: number; // For completed helps
  @ViewChild('chatScroll') chatScroll!: ElementRef;

  // ✅ Add event emitter to notify parent about points changes
  @Output() requestCompleted = new EventEmitter<void>();

  visible = false;
  chatAccepted = false;
  messages: UIMessage[] = [];
  
  // ✅ Add loading state
  isLoading = false;

  // ✅ Add chat input state
  newMessage = '';
  sendingMessage = false;
  error: string | null = null;

  /** Complete / rating state */
  completed = false;
  rating = 0;
  rated = false;

  // Computed properties for UI logic
  get isRequest(): boolean {
    return this.itemType === 'Request';
  }

  get isCompletedHelp(): boolean {
    return this.itemType === 'Help';
  }

  get shouldShowCompleteButton(): boolean {
    return this.isRequest && !this.completed && this.chatAccepted;
  }

  get shouldShowInteractiveRating(): boolean {
    return this.isRequest && this.completed && !this.rated;
  }

  get shouldShowReadOnlyRating(): boolean {
    return this.isCompletedHelp && this.existingRating !== undefined;
  }

  get displayRating(): number {
    if (this.isCompletedHelp && this.existingRating !== undefined) {
      return this.existingRating;
    }
    return this.rating;
  }

  // ✅ Chat input visibility logic
  get shouldShowChatInput(): boolean {
    // Show chat input for active requests, or for helps (to allow helper to respond)
    return (this.isRequest && this.chatAccepted && !this.completed) || 
           (this.itemType === 'Help' && this.chatAccepted);
  }

  private sub?: Subscription;
  private needScroll = false;

  private chatSvc!: ChatService;
  private reqSvc!: HelpRequestService;
  private currentUserId!: string;

  constructor(private injector: Injector) {}

  private getServices() {
    if (!this.chatSvc) this.chatSvc = this.injector.get(ChatService);
    if (!this.reqSvc)  this.reqSvc  = this.injector.get(HelpRequestService);
  }

  // ✅ Helper method to get current user ID with fallback strategies
  private getCurrentUserId(): string {
    // Strategy 1: Try the service method
    try {
      if (this.reqSvc) {
        const serviceUserId = this.reqSvc.currentUserId();
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

  /** ✅ Updated showDialog method - now async and with loading state */
  async showDialog(): Promise<void> {
    // Clean up any prior subscription / state
    this.sub?.unsubscribe();
    this.messages = [];
    this.completed = false;
    this.rated = false;
    this.rating = 0;
    this.newMessage = '';
    this.error = null;
    
    // ✅ Show dialog and loading state
    this.visible = true;
    this.isLoading = true;
    
    try {
      // ✅ Wait for initialization to complete
      if (this.isCompletedHelp) {
        await this.loadCompletedHelpData();
      } else {
        await this.initialize();
      }
    } catch (error) {
      console.error('Failed to initialize dialog:', error);
      this.error = 'Failed to load chat data';
    } finally {
      // ✅ Hide loading state when done
      this.isLoading = false;
    }
  }

  /** ✅ Updated to return Promise for completed helps */
  private async loadCompletedHelpData(): Promise<void> {
    this.getServices();
    this.currentUserId = this.getCurrentUserId();

    // Load existing chat history
    try {
      const hist = await this.reqSvc.getChatHistory(this.requestId);
      this.messages = hist.map(m => this.toUI(m));
    } catch {
      this.messages = [];
    }
    
    // ✅ Ensure scrolling happens after messages are loaded
    this.scrollToBottom();
    
    // ✅ Subscribe for live updates even for completed helps (in case there are late messages)
    this.sub = this.chatSvc
      .onMessage(this.requestId)
      .subscribe(m => {
        this.messages.push(this.toUI(m));
        this.scrollToBottom();
      });
  }

  /** Tear down on hide */
  onDialogHide(): void {
    this.sub?.unsubscribe();
    this.newMessage = '';
    this.error = null;
  }

  /** ✅ Updated initialize method to return Promise */
  private async initialize(): Promise<void> {
    this.getServices();
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

    // 1) Load request to see if it's already in‐progress
    try {
      const req = await this.reqSvc.getRequest(this.requestId);
      this.chatAccepted = req.status === 'IN_PROGRESS';
      
      // If request is already completed and has a rating, show it
      if (req.status === 'COMPLETED' && req.rating) {
        this.completed = true;
        this.rated = true;
        this.rating = req.rating;
      }
    } catch {
      this.chatAccepted = false;
    }

    // 2) Load existing chat history
    try {
      const hist = await this.reqSvc.getChatHistory(this.requestId);
      this.messages = hist.map(m => this.toUI(m));
    } catch {
      this.messages = [];
    }
    
    // ✅ Ensure scrolling happens after messages are loaded
    this.scrollToBottom();

    // 3) Subscribe for live updates
    this.sub = this.chatSvc
      .onMessage(this.requestId)
      .subscribe(m => {
        this.messages.push(this.toUI(m));
        this.scrollToBottom();
      });
  }

  // ✅ FIXED: Simplified toUI method using direct comparison like the working popup component
  private toUI(m: ChatMessage): UIMessage {
    let sender: 'me' | 'them' | 'system';
    let senderName: string;
    
    if (m.senderId === 'system') {
      sender = 'system';
      senderName = 'System';
    } else {
      // ✅ Fixed: Simple direct comparison like the working popup component
      const isMyMessage = m.senderId === this.currentUserId;
      
      if (this.isRequest) {
        // For requests (recipient's perspective)
        sender = isMyMessage ? 'me' : 'them';
        senderName = isMyMessage ? 'You' : 'Helper';
      } else {
        // For helps (helper's perspective) 
        sender = isMyMessage ? 'me' : 'them';
        senderName = isMyMessage ? 'You' : 'Requester';
      }
    }
    
    const processed = this.processMessageContent(m.content);
    
    // Enhanced debug logging
    console.log('Message Debug:', {
      messageContent: m.content,
      senderId: m.senderId,
      currentUserId: this.currentUserId,
      itemType: this.itemType,
      isMyMessage: m.senderId === this.currentUserId,
      determinedSender: sender,
      senderName: senderName
    });
    
    return {
      id:         m.id ?? `msg-${Date.now()}-${Math.random()}`,
      type:       m.senderId === 'system' ? 'system' : 'text',
      sender:     sender,
      senderName: senderName,
      text:       processed.text,
      images:     processed.images,
      timestamp:  new Date(m.timestamp)
    };
  }

  // ✅ Add sendMessage functionality
  async sendMessage(): Promise<void> {
    const txt = this.newMessage.trim();
    if (!txt || this.sendingMessage) return;

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

    this.sendingMessage = true;
    this.error = null;

    try {
      console.log('=== SENDING MESSAGE DEBUG ===');
      console.log('senderId:', `"${this.currentUserId}"`);
      console.log('requestId:', this.requestId);
      console.log('content:', txt);
      console.log('============================');

      const msg: ChatMessage = {
        requestId: this.requestId,
        senderId: this.currentUserId,
        content: txt,
        timestamp: new Date().toISOString()
      };

      console.log('Complete message object:', msg);

      await this.chatSvc.sendMessage(msg);
      this.newMessage = '';
      
    } catch (error) {
      console.error('Failed to send message:', error);
      this.error = 'Failed to send message';
    } finally {
      this.sendingMessage = false;
    }
  }

  // ✅ Add keyboard handler for Enter key
  onInputKeydown(ev: KeyboardEvent): void {
    if (ev.key === 'Enter' && !ev.shiftKey && this.shouldShowChatInput) {
      ev.preventDefault();
      this.sendMessage();
    }
  }

  // ✅ Add error clearing
  clearError(): void {
    this.error = null;
  }

  /** Mark the help as completed, enables rating (only for requests) */
  async onComplete() {
    if (!this.isRequest) return;
    
    try {
      await this.reqSvc.completeRequest(this.requestId);
      this.completed = true;
      
      // ✅ Emit event to notify parent component about completion
      // This allows the parent to refresh user data (including points balance)
      this.requestCompleted.emit();
      
    } catch (e) {
      console.error('Complete failed', e);
    }
  }

  /** Submit the rating, then lock it (only for requests) */
  async onRate() {
    if (!this.isRequest) return;
    
    try {
      await this.reqSvc.rateRequest(this.requestId, this.rating);
      this.rated = true;
    } catch (e) {
      console.error('Rating failed', e);
    }
  }

  ngAfterViewChecked(): void {
    if (this.needScroll) {
      this.scrollToBottom();
      this.needScroll = false;
    }
  }

  private scrollToBottom(): void {
    this.needScroll = true;
    setTimeout(() => {
      try {
        const el = this.chatScroll.nativeElement;
        el.scrollTop = el.scrollHeight;
      } catch {}
    }, 0);
  }

  trackByMessageId(_: number, m: UIMessage): string {
    return m.id;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
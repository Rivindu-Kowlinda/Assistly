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

  // ✅ Add request status tracking for proper validation
  private requestStatus: string = '';

  // Computed properties for UI logic
  get isRequest(): boolean {
    return this.itemType === 'Request';
  }

  get isCompletedHelp(): boolean {
    return this.itemType === 'Help';
  }

  get shouldShowCompleteButton(): boolean {
    return this.isRequest && !this.completed && this.chatAccepted && this.requestStatus === 'IN_PROGRESS';
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

  // ✅ FIXED: Strict chat input visibility logic with maximum validation
  get shouldShowChatInput(): boolean {
    // Only show chat input for:
    // 1. Requests that are specifically IN_PROGRESS status AND chatAccepted is true
    // 2. Never show for completed requests or helps
    
    console.log('Chat input visibility check:', {
      isRequest: this.isRequest,
      itemType: this.itemType,
      requestStatus: this.requestStatus,
      chatAccepted: this.chatAccepted,
      completed: this.completed,
      shouldShow: this.isRequest && 
                  this.requestStatus === 'IN_PROGRESS' && 
                  this.chatAccepted && 
                  !this.completed
    });

    return this.isRequest && 
           this.requestStatus === 'IN_PROGRESS' && 
           this.chatAccepted && 
           !this.completed;
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

  // ✅ FIXED: Enhanced message processing with timeline-based sender logic
  private processMessages(chatHistory: ChatMessage[]): UIMessage[] {
    // First, find the system acceptance message index
    const systemAcceptanceIndex = chatHistory.findIndex(msg => 
      msg.senderId === 'system' && 
      msg.content.toLowerCase().includes('accepted')
    );
    
    console.log('System acceptance message found at index:', systemAcceptanceIndex);
    
    return chatHistory.map((m, index) => {
      let sender: 'me' | 'them' | 'system';
      let senderName: string;
      
      if (m.senderId === 'system') {
        sender = 'system';
        senderName = 'System';
      } else {
        // ✅ CRITICAL FIX: Timeline-based sender determination
        const isBeforeAcceptance = systemAcceptanceIndex !== -1 && index < systemAcceptanceIndex;
        
        if (isBeforeAcceptance) {
          // Messages before acceptance are ALWAYS from the requester
          if (this.isRequest) {
            // For requests (recipient's perspective) - before acceptance = always "me" (requester)
            sender = 'me';
            senderName = 'You';
          } else {
            // For helps (helper's perspective) - before acceptance = always "them" (requester)
            sender = 'them';
            senderName = 'Requester';
          }
        } else {
          // Messages after acceptance follow normal logic based on actual senderId
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
      }
      
      const processed = this.processMessageContent(m.content);
      
      // Enhanced debug logging
      console.log('Message Processing Debug:', {
        index,
        messageContent: m.content,
        senderId: m.senderId,
        currentUserId: this.currentUserId,
        itemType: this.itemType,
        timestamp: m.timestamp,
        systemAcceptanceIndex,
        isBeforeAcceptance: m.senderId !== 'system' ? (systemAcceptanceIndex !== -1 && index < systemAcceptanceIndex) : 'N/A',
        determinedSender: sender,
        senderName: senderName
      });
      
      return {
        id:         m.id ?? `msg-${Date.now()}-${Math.random()}-${index}`,
        type:       m.senderId === 'system' ? 'system' : 'text',
        sender:     sender,
        senderName: senderName,
        text:       processed.text,
        images:     processed.images,
        timestamp:  new Date(m.timestamp)
      };
    });
  }

  // ✅ Helper method for processing live messages (always after acceptance)
  private toLiveUI(m: ChatMessage): UIMessage {
    let sender: 'me' | 'them' | 'system';
    let senderName: string;
    
    if (m.senderId === 'system') {
      sender = 'system';
      senderName = 'System';
    } else {
      // Live messages are always after acceptance, so use normal logic
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

  /** ✅ Updated showDialog method with proper cleanup and validation */
  async showDialog(): Promise<void> {
    // ✅ CRITICAL: Clean up ALL state when opening dialog
    this.resetDialogState();
    
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

  // ✅ NEW: Comprehensive state reset method
  private resetDialogState(): void {
    // Clean up subscription
    this.sub?.unsubscribe();
    this.sub = undefined;
    
    // Reset all dialog state
    this.messages = [];
    this.completed = false;
    this.rated = false;
    this.rating = 0;
    this.newMessage = '';
    this.error = null;
    this.chatAccepted = false;
    this.requestStatus = '';
    this.sendingMessage = false;
    this.needScroll = false;
    
    console.log('Dialog state reset for:', this.itemType, this.requestId);
  }

  /** ✅ Updated to return Promise for completed helps */
  private async loadCompletedHelpData(): Promise<void> {
    this.getServices();
    this.currentUserId = this.getCurrentUserId();

    // ✅ For completed helps, explicitly set status to ensure no chat input
    this.requestStatus = 'COMPLETED';
    this.chatAccepted = false;

    // Load existing chat history
    try {
      const chatHistory = await this.reqSvc.getChatHistory(this.requestId);
      // ✅ Use the new processMessages method
      this.messages = this.processMessages(chatHistory);
    } catch {
      this.messages = [];
    }
    
    // ✅ Ensure scrolling happens after messages are loaded
    this.scrollToBottom();
    
    // ✅ Subscribe for live updates even for completed helps (in case there are late messages)
    this.sub = this.chatSvc
      .onMessage(this.requestId)
      .subscribe(m => {
        const uiMessage = this.toLiveUI(m);
        this.messages.push(uiMessage);
        this.scrollToBottom();
      });
  }

  /** ✅ Enhanced onDialogHide with complete cleanup */
  onDialogHide(): void {
    console.log('Dialog hiding - cleaning up state');
    this.resetDialogState();
  }

  /** ✅ Updated initialize method with proper status tracking */
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

    // 1) Load request to see current status and set proper state
    try {
      const req = await this.reqSvc.getRequest(this.requestId);
      
      // ✅ CRITICAL: Always track the actual request status
      this.requestStatus = req.status;
      
      console.log('Request status loaded:', {
        requestId: this.requestId,
        status: req.status,
        itemType: this.itemType
      });
      
      // Set chatAccepted based on status
      this.chatAccepted = req.status === 'IN_PROGRESS';
      
      // If request is already completed and has a rating, show it
      if (req.status === 'COMPLETED' && req.rating) {
        this.completed = true;
        this.rated = true;
        this.rating = req.rating;
      }
    } catch (error) {
      console.error('Failed to load request:', error);
      this.chatAccepted = false;
      this.requestStatus = 'UNKNOWN';
    }

    // 2) Load existing chat history and process with timeline logic
    try {
      const chatHistory = await this.reqSvc.getChatHistory(this.requestId);
      // ✅ Use the new processMessages method instead of mapping with toUI
      this.messages = this.processMessages(chatHistory);
    } catch {
      this.messages = [];
    }
    
    // ✅ Ensure scrolling happens after messages are loaded
    this.scrollToBottom();

    // 3) Subscribe for live updates ONLY if this is an active request
    if (this.isRequest && this.requestStatus === 'IN_PROGRESS') {
      this.sub = this.chatSvc
        .onMessage(this.requestId)
        .subscribe(m => {
          // ✅ For live messages, we need to determine if they come after acceptance
          // Since we're subscribing to live updates, any new message is after acceptance
          const uiMessage = this.toLiveUI(m);
          this.messages.push(uiMessage);
          this.scrollToBottom();
        });
    } else {
      console.log('Skipping live message subscription - not an active request');
    }
  }

  // ✅ Enhanced sendMessage with additional validation
  async sendMessage(): Promise<void> {
    const txt = this.newMessage.trim();
    if (!txt || this.sendingMessage) return;

    // ✅ CRITICAL: Additional validation before sending
    if (!this.shouldShowChatInput) {
      console.error('SEND MESSAGE BLOCKED: Chat input should not be visible');
      this.error = 'Chat is not available for this item';
      return;
    }

    if (this.requestStatus !== 'IN_PROGRESS') {
      console.error('SEND MESSAGE BLOCKED: Request is not in progress, status:', this.requestStatus);
      this.error = 'Cannot send messages - request is not active';
      return;
    }

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
      console.log('requestStatus:', this.requestStatus);
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

  // ✅ Enhanced keyboard handler with validation
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

  /** ✅ Enhanced onComplete with status update */
  async onComplete() {
    if (!this.isRequest || this.requestStatus !== 'IN_PROGRESS') return;
    
    try {
      await this.reqSvc.completeRequest(this.requestId);
      this.completed = true;
      this.requestStatus = 'COMPLETED'; // ✅ Update status to hide chat input
      
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
    console.log('Component destroying - cleaning up');
    this.resetDialogState();
  }
}
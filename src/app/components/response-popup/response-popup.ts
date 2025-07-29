// src/app/components/response-popup/popup.component.ts

import {
  Component, Input, ViewChild, ElementRef,
  AfterViewChecked, OnDestroy, Injector, Output, EventEmitter
} from '@angular/core';
import { DialogModule }   from 'primeng/dialog';
import { ButtonModule }   from 'primeng/button';
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

  visible      = false;
  chatAccepted = false;
  messages: UIMessage[] = [];

  /** Complete / rating state */
  completed = false;
  rating    = 0;
  rated     = false;

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

  /** Always re-initialize on each open */
  async showDialog(): Promise<void> {
    // Clean up any prior subscription / state
    this.sub?.unsubscribe();
    this.messages = [];
    this.completed = false;
    this.rated = false;
    this.rating = 0;
    
    // ✅ Show loading state first
    this.visible = true;
    
    try {
      // ✅ Wait for initialization to complete before proceeding
      if (this.isCompletedHelp) {
        await this.loadCompletedHelpData();
      } else {
        await this.initialize();
      }
    } catch (error) {
      console.error('Failed to initialize dialog:', error);
      // Handle error state if needed
    }
  }

  /** Load data for completed helps (chat history only, no live updates) */
  private async loadCompletedHelpData(): Promise<void> {
    this.getServices();
    this.currentUserId = this.reqSvc.currentUserId();
  
    // Load existing chat history
    try {
      const hist = await this.reqSvc.getChatHistory(this.requestId);
      this.messages = hist.map(m => this.toUI(m));
    } catch {
      this.messages = [];
    }
    
    // ✅ Ensure scrolling happens after messages are loaded
    this.scrollToBottom();
    
    // No live subscription needed for completed helps
  }
  /** Tear down on hide */
  onDialogHide(): void {
    this.sub?.unsubscribe();
  }

  private async initialize(): Promise<void> {
    this.getServices();
    this.currentUserId = this.reqSvc.currentUserId();
  
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
  
    // 3) Subscribe for live updates (only for requests)
    this.sub = this.chatSvc
      .onMessage(this.requestId)
      .subscribe(m => {
        this.messages.push(this.toUI(m));
        this.scrollToBottom();
      });
  }

  private toUI(m: ChatMessage): UIMessage {
    const me = m.senderId === this.currentUserId;
    const processed = this.processMessageContent(m.content);
    
    return {
      id:         m.id ?? `msg-${Date.now()}-${Math.random()}`,
      type:       'text',
      sender:     me ? 'me' : 'them',
      senderName: me ? 'You' : (this.isRequest ? 'Helper' : 'Requester'),
      text:       processed.text,
      images:     processed.images,
      timestamp:  new Date(m.timestamp)
    };
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
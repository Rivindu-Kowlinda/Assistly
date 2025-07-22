import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { FormsModule } from '@angular/forms';
import { DatePipe, CommonModule } from '@angular/common';

interface ChatMessage {
  id: number;
  sender: 'me' | 'them' | 'system';
  senderName: string;
  avatar: string;
  text: string;
  timestamp: Date;
  type: 'text' | 'system';
}

@Component({
  selector: 'popup',
  templateUrl: './popup.html',
  styleUrls: ['./popup.css'],
  standalone: true,
  imports: [Dialog, ButtonModule, InputTextModule, AvatarModule, FormsModule, DatePipe, CommonModule]
})
export class Popup implements AfterViewChecked {
  @ViewChild('chatScroll') chatScroll!: ElementRef;
  
  visible: boolean = false;
  newMessage: string = '';
  isTyping: boolean = false;
  chatAccepted: boolean = false;
  private shouldScrollToBottom = false;

  // Realistic chat data
  messages: ChatMessage[] = [
    {
      id: 1,
      sender: 'system',
      senderName: 'System',
      avatar: '',
      text: 'Welcome to PrimeTek Team Chat!',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      type: 'system'
    },
    {
      id: 2,
      sender: 'them',
      senderName: 'Sarah Chen',
      avatar: 'https://i.pravatar.cc/40?u=sarah',
      text: 'Hey everyone! Just pushed the latest UI updates to the dev branch 🚀',
      timestamp: new Date(Date.now() - 2700000), // 45 min ago
      type: 'text'
    },
    {
      id: 3,
      sender: 'them',
      senderName: 'Mike Rodriguez',
      avatar: 'https://i.pravatar.cc/40?u=mike',
      text: 'Awesome work Sarah! The new design looks incredible',
      timestamp: new Date(Date.now() - 2640000), // 44 min ago
      type: 'text'
    },
    {
      id: 4,
      sender: 'me',
      senderName: 'You',
      avatar: 'https://i.pravatar.cc/40?u=me',
      text: 'I agree! The color scheme is much more modern. Great job! 👏',
      timestamp: new Date(Date.now() - 2580000), // 43 min ago
      type: 'text'
    },
    {
      id: 5,
      sender: 'them',
      senderName: 'Alex Kim',
      avatar: 'https://i.pravatar.cc/40?u=alex',
      text: 'Should we schedule a review meeting for tomorrow?',
      timestamp: new Date(Date.now() - 2400000), // 40 min ago
      type: 'text'
    },
    {
      id: 6,
      sender: 'them',
      senderName: 'Sarah Chen',
      avatar: 'https://i.pravatar.cc/40?u=sarah',
      text: 'That sounds perfect! I\'ll send out calendar invites',
      timestamp: new Date(Date.now() - 2340000), // 39 min ago
      type: 'text'
    },
    {
      id: 7,
      sender: 'me',
      senderName: 'You',
      avatar: 'https://i.pravatar.cc/40?u=me',
      text: 'Count me in! What time works best for everyone?',
      timestamp: new Date(Date.now() - 1800000), // 30 min ago
      type: 'text'
    },
    {
      id: 8,
      sender: 'them',
      senderName: 'Mike Rodriguez',
      avatar: 'https://i.pravatar.cc/40?u=mike',
      text: 'Morning works better for me, maybe 10 AM?',
      timestamp: new Date(Date.now() - 1740000), // 29 min ago
      type: 'text'
    },
    {
      id: 9,
      sender: 'them',
      senderName: 'Alex Kim',
      avatar: 'https://i.pravatar.cc/40?u=alex',
      text: '10 AM works! Looking forward to seeing the updates in action',
      timestamp: new Date(Date.now() - 900000), // 15 min ago
      type: 'text'
    }
  ];

  private teamMembers = [
    { name: 'Sarah Chen', avatar: 'https://i.pravatar.cc/40?u=sarah' },
    { name: 'Mike Rodriguez', avatar: 'https://i.pravatar.cc/40?u=mike' },
    { name: 'Alex Kim', avatar: 'https://i.pravatar.cc/40?u=alex' },
    { name: 'Emma Wilson', avatar: 'https://i.pravatar.cc/40?u=emma' }
  ];

  showDialog() {
    this.visible = true;
    this.shouldScrollToBottom = true;
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.chatAccepted) return;

    const newMsg: ChatMessage = {
      id: this.messages.length + 1,
      sender: 'me',
      senderName: 'You',
      avatar: 'https://i.pravatar.cc/40?u=me',
      text: this.newMessage.trim(),
      timestamp: new Date(),
      type: 'text'
    };

    this.messages.push(newMsg);
    this.newMessage = '';
    this.shouldScrollToBottom = true;

    // Simulate random responses from team members
    this.simulateResponse();
  }

  acceptChat() {
    this.chatAccepted = true;
    // Here you would typically make an API call to accept the chat
    // Example: this.chatService.acceptChat().subscribe(...)
    
    // Add a system message to indicate chat was accepted
    const acceptMessage: ChatMessage = {
      id: this.messages.length + 1,
      sender: 'system',
      senderName: 'System',
      avatar: '',
      text: 'You joined the chat',
      timestamp: new Date(),
      type: 'system'
    };
    
    this.messages.push(acceptMessage);
    this.shouldScrollToBottom = true;
  }

  private simulateResponse() {
    // Only simulate responses if chat is accepted
    if (!this.chatAccepted) return;
    
    // 30% chance of getting a response
    if (Math.random() > 0.3) return;

    this.isTyping = true;
    
    setTimeout(() => {
      const randomMember = this.teamMembers[Math.floor(Math.random() * this.teamMembers.length)];
      const responses = [
        "That's a great point!",
        "I totally agree with that approach",
        "Thanks for the update! 👍",
        "Sounds good to me",
        "Let me know if you need any help with that",
        "Perfect! I'll work on that",
        "Great idea! Let's implement it",
        "I was thinking the same thing",
        "That should work well",
        "Excellent work as always! 🎉"
      ];

      const responseMsg: ChatMessage = {
        id: this.messages.length + 1,
        sender: 'them',
        senderName: randomMember.name,
        avatar: randomMember.avatar,
        text: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        type: 'text'
      };

      this.messages.push(responseMsg);
      this.isTyping = false;
      this.shouldScrollToBottom = true;
    }, 1500 + Math.random() * 2000); // Random delay between 1.5-3.5 seconds
  }

  private scrollToBottom() {
    if (this.chatScroll?.nativeElement) {
      this.chatScroll.nativeElement.scrollTop = this.chatScroll.nativeElement.scrollHeight;
    }
  }

  onInputKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey && this.chatAccepted) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  getMessageTime(timestamp: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return timestamp.toLocaleDateString();
  }

  trackByMessageId(index: number, message: ChatMessage): number {
    return message.id;
  }
}
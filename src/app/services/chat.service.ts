// src/app/services/chat.service.ts
// src/app/services/chat.service.ts
import { Injectable } from '@angular/core';
import { Client, IMessage, Stomp, IFrame } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface ChatMessage {
  id?: string;
  requestId: string;
  senderId: string;
  content: string;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private client!: Client;
  private subjects: { [reqId: string]: Subject<ChatMessage> } = {};
  private connectionState = new BehaviorSubject<boolean>(false);
  private connecting = false;

  connect(): Promise<void> {
    if (this.client?.active) {
      return Promise.resolve();
    }
    if (this.connecting) {
      return new Promise((res) =>
        this.connectionState.pipe(filter(v => v)).subscribe(() => res())
      );
    }

    this.connecting = true;
    return new Promise((resolve, reject) => {
      this.client = Stomp.over(() => new SockJS('http://localhost:8080/ws-chat'));

      // ← here’s the fix:
      this.client.onStompError = (frame: IFrame) => {
        const errText = frame.body || JSON.stringify(frame.headers);
        console.error('STOMP error frame:', frame);
        console.error('Error message:', errText);
        this.connecting = false;
        this.connectionState.next(false);
        reject(new Error(errText));
      };

      this.client.onConnect = () => {
        console.log('WebSocket connected');
        this.connecting = false;
        this.connectionState.next(true);
        resolve();
      };

      this.client.onDisconnect = () => {
        console.log('WebSocket disconnected');
        this.connectionState.next(false);
      };

      try {
        this.client.activate();
      } catch (e) {
        this.connecting = false;
        reject(e);
      }
    });
  }

  /**
   * Returns an Observable of live ChatMessage for a given requestId.
   * Will buffer subscription until after connect().
   */
  onMessage(requestId: string): Observable<ChatMessage> {
    if (!this.subjects[requestId]) {
      this.subjects[requestId] = new Subject<ChatMessage>();
      this.connect()
        .then(() => {
          this.client.subscribe(`/topic/chat.${requestId}`, (msg: IMessage) => {
            try {
              const cm = JSON.parse(msg.body) as ChatMessage;
              this.subjects[requestId].next(cm);
            } catch (err) {
              console.error('Invalid chat message JSON', err);
            }
          });
        })
        .catch(err => {
          console.error('WebSocket subscription failure', err);
          this.subjects[requestId].error(err);
        });
    }
    return this.subjects[requestId].asObservable();
  }

  /** Publishes a ChatMessage to the broker (/app/chat.send) */
  async sendMessage(msg: ChatMessage): Promise<void> {
    await this.connect();
    if (!this.client.active) {
      throw new Error('WebSocket not connected');
    }
    this.client.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(msg)
    });
  }

  /** Cleanly tear down the WebSocket connection */
  disconnect(): void {
    this.client?.deactivate();
    Object.values(this.subjects).forEach(s => s.complete());
    this.subjects = {};
    this.connectionState.next(false);
  }
}

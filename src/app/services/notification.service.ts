import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<Notification | null>(null);
  public notification$ = this.notificationSubject.asObservable();

  showNotification(message: string, type: 'info' | 'warning' | 'error' | 'success' = 'info', duration: number = 5000) {
    const notification: Notification = { message, type, duration };
    this.notificationSubject.next(notification);

    if (duration > 0) {
      setTimeout(() => {
        this.clearNotification();
      }, duration);
    }
  }

  clearNotification() {
    this.notificationSubject.next(null);
  }
}
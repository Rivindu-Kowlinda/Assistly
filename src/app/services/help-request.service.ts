// src/app/services/help-request.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HelpRequest } from '../employee/models/help-request.model';
import { ChatMessage } from './chat.service';

@Injectable({ providedIn: 'root' })
export class HelpRequestService {
  private readonly baseUrl = 'http://localhost:8080/api/employee';

  constructor(private http: HttpClient) {}

  /** Should be set after login; or decode from JWT */
  currentUserId(): string {
    return localStorage.getItem('userId') ?? '';
  }

  /** Fetch full HelpRequest by ID */
  async getRequest(reqId: string): Promise<HelpRequest> {
    return firstValueFrom(
      this.http.get<HelpRequest>(`${this.baseUrl}/requests/${reqId}`)
    );
  }

  /**
   * Load entire chat history for a request
   * Falls back to [] on any error
   */
  async getChatHistory(reqId: string): Promise<ChatMessage[]> {
    const messages = await firstValueFrom(
      this.http
        .get<ChatMessage[]>(`${this.baseUrl}/requests/${reqId}/chat`)
        .pipe(catchError(err => {
          console.error('Error fetching chat history', err);
          return of<ChatMessage[]>([]);
        }))
    );
    return Array.isArray(messages) ? messages : [];
  }

  /** Accept (claim) a pending request → transitions it to IN_PROGRESS */
  async acceptRequest(reqId: string): Promise<HelpRequest> {
    return firstValueFrom(
      this.http.post<HelpRequest>(
        `${this.baseUrl}/requests/${reqId}/accept`, {}
      )
    );
  }
    /** POST /requests/{id}/complete */
    async completeRequest(reqId: string): Promise<void> {
      await firstValueFrom(
        this.http.post<void>(
          `${this.baseUrl}/requests/${reqId}/complete`,
          {}
        )
      );
    }
  
    /** POST /requests/{id}/rate?rating={n} */
    async rateRequest(reqId: string, rating: number): Promise<void> {
      await firstValueFrom(
        this.http.post<void>(
          `${this.baseUrl}/requests/${reqId}/rate?rating=${rating}`,
          {}
        )
      );
    }
}

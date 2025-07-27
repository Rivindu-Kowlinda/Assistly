import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
    id: string;
    username: string;
    password?: string;
    role: string[];  // ← It's an array
    balancePoints?: number;
    monthlyAllocation?: number;
    requestCount?: number;
    helpPendingCount?: number;
    helpAcceptedCount?: number;
  }
  

@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrl = 'http://localhost:8080/api/admin/profile'; // <-- Update this URL if needed

  constructor(private http: HttpClient) {}

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.baseUrl);
  }
}

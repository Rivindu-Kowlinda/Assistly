import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface UserProfileResponse {
  id: string;
  username: string;
  password: string | null;
  role: string[];
  balancePoints: number;
  monthlyAllocation: number;
  requestCount: number;
  helpPendingCount: number;
  helpAcceptedCount: number;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:8080/api/employee/profile'; 

  constructor(private http: HttpClient) {}

  getProfile(): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(this.apiUrl);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminRequest {
  id: string;
  recipientUsernames: string;
  heading: string
  requestName: string;
  status: string;
  cost: number;
  createdAt: string;
}

export interface AdminDashboardResponse {
  responses: AdminRequest[];
  requests:  AdminRequest[];
}

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  private url = 'http://localhost:8080/api/admin/dashboard';
  constructor(private http: HttpClient) {}
  getDashboard(): Observable<AdminDashboardResponse> {
    return this.http.get<AdminDashboardResponse>(this.url);
  }
}

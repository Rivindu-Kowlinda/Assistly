// src/app/services/dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EmployeeStat {
  username: string;
  pointsEarned: number;
  helpsProvided: number;
}

export interface PointsData {
  earned: number;
  spent: number;
  monthlyAllocation: number;
  balance: number;
}

export interface RequestMade {
  id: string;
  recipientUsernames: string;
  heading: string;
  status: string;
  cost: number;
  createdAt: string;
}

export interface DashboardResponse {
  employeeStats: EmployeeStat[];
  points: PointsData;
  requestsMade: RequestMade[];
  helpsProvided: RequestMade[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private endpoint = 'http://localhost:8080/api/employee/dashboard';
  constructor(private http: HttpClient) {}
  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(this.endpoint);
  }
}

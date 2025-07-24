// src/app/services/dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private dashboardUrl = 'http://localhost:8080/api/dashboard';

  constructor(private http: HttpClient) {}

  getDashboardData(): Observable<any> {
    return this.http.get<any>(this.dashboardUrl);
  }
}

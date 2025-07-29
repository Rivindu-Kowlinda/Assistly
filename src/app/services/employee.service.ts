// src/app/services/employee.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';

export interface EmployeeResponse {
  id: string;
  username: string;
  password: string;
  role: string[];
  balancePoints: number;
  monthlyAllocation: number;
  requestCount: number;
  helpPendingCount: number;
  helpAcceptedCount: number;
}

export interface RolePrice {
  id: string;
  role: string;
  cost: number;
}

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private employeesUrl = 'http://localhost:8080/api/employee/employees';
  private pricesUrl    = 'http://localhost:8080/api/employee/prices';
  private profileUrl   = 'http://localhost:8080/api/employee/profile';

  constructor(private http: HttpClient) {}

  getEmployeeData(): Observable<[EmployeeResponse[], RolePrice[]]> {
    return forkJoin([
      this.http.get<EmployeeResponse[]>(this.employeesUrl),
      this.http.get<RolePrice[]>(this.pricesUrl)
    ]);
  }

  /** Fetch the currently logged‑in user */
  getProfile(): Observable<EmployeeResponse> {
    return this.http.get<EmployeeResponse>(this.profileUrl);
  }
}

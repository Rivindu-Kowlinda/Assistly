// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiUser {
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

// Only the five fields sent on create
export interface CreateUserDto {
  username: string;
  password: string;
  role: string[];
  balancePoints: number;
  monthlyAllocation: number;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:8080/api/admin/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<ApiUser[]> {
    return this.http.get<ApiUser[]>(this.apiUrl);
  }

  updateUser(user: ApiUser): Observable<any> {
    return this.http.put(`${this.apiUrl}/${user.id}`, user);
  }

  createUser(dto: CreateUserDto): Observable<ApiUser> {
    return this.http.post<ApiUser>(this.apiUrl, dto);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { HelpRequest } from '../employee/models/help-request.model';

@Injectable({ providedIn: 'root' })
export class HelpService {
  constructor(private http: HttpClient) {
    console.log('🔧 HelpService constructor called');
    console.log('📡 HttpClient injected:', !!this.http);
  }

  getReceivedRequests(): Observable<HelpRequest[]> {
    console.log('🚀 getReceivedRequests() called');
    console.log('📡 HttpClient status:', !!this.http);
    
    return this.http.get<HelpRequest[]>('http://localhost:8080/api/employee/requests/received').pipe(
      tap(response => {
        console.log('✅ API Response received:', response);
        console.log('📊 Response length:', response?.length);
        console.log('🔍 First item:', response?.[0]);
      }),
      catchError(error => {
        console.error('❌ API Error in HelpService:', error);
        console.error('📋 Error details:', {
          message: error.message,
          status: error.status,
          url: error.url,
          statusText: error.statusText
        });
        return of([]); // Return empty array on error
      })
    );
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HelpRequest } from '../employee/models/help-request.model';

@Injectable({ providedIn: 'root' })
export class HelpService {
  constructor(private http: HttpClient) {}

  getReceivedRequests(): Observable<HelpRequest[]> {
    return this.http.get<HelpRequest[]>('http://localhost:8080/api/employee/requests/received');
  }
}

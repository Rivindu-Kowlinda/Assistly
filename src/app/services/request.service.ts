import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RequestService {
  private apiUrl = 'http://localhost:8080/api/employee/requests'; // Adjust if backend URL differs

  constructor(private http: HttpClient) {}

  /**
   * Submit a help request with optional images
   * @param data FormData with { data: JSON, images: File[] }
   */
  submitHelpRequest(data: FormData): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getRequests(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}

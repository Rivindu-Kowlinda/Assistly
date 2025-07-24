// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable, throwError } from 'rxjs';
// import { catchError, map } from 'rxjs/operators';
// import { environment } from '../../environments/environment';

// interface LoginResponse {
//   token: string;
//   // Add other response properties here if needed
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class ApiService {
//   apiUrl: string = environment.apiUrl;
//   version: string = environment.version;
//   private tokenKey = 'auth_token';

//   constructor(private http: HttpClient) {
//     console.log('Using API URL:', this.apiUrl);
//   }

//   // Login request
//   login(email: string, password: string): Observable<any> {
//     const url = `${this.apiUrl}/auth/login`;
//     const body = { email, password };
    
//     return this.http.post<LoginResponse>(url, body).pipe(
//       map(response => {
//         const token = response.token;
//         if (token) {
//           this.setToken(token);
//         }
//         return response;
//       }),
//       catchError(this.handleError)
//     );
//   }

//   // Get current user
//   getCurrentUser(): Observable<any> {
//     return this.http.get(`${this.apiUrl}/auth/me`).pipe(
//       catchError(this.handleError)
//     );
//   }

//   // Get token from localStorage
//   getToken(): string | null {
//     return localStorage.getItem(this.tokenKey);
//   }

//   // Set token in localStorage
//   setToken(token: string): void {
//     localStorage.setItem(this.tokenKey, token);
//   }

//   // Remove token from localStorage
//   removeToken(): void {
//     localStorage.removeItem(this.tokenKey);
//   }

//   // Check if user is authenticated
//   isAuthenticated(): boolean {
//     return !!this.getToken();
//   }

//   // Error handling
//   private handleError(error: any): Observable<never> {
//     let errorMessage = 'An error occurred';
    
//     if (error.error instanceof ErrorEvent) {
//       // Client-side error
//       errorMessage = `Error: ${error.error.message}`;
//     } else {
//       // Server-side error
//       errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
//     }

//     return throwError(() => new Error(errorMessage));
//   }
// }
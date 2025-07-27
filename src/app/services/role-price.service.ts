import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RolePrice {
  id: string;
  role: string;
  cost: number;
}

@Injectable({ providedIn: 'root' })
export class RolePriceService {
  private getUrl = 'http://localhost:8080/api/admin/prices';
  private updateUrl = 'http://localhost:8080/api/admin/prices';

  constructor(private http: HttpClient) {}

  getPrices(): Observable<RolePrice[]> {
    return this.http.get<RolePrice[]>(this.getUrl);
  }

  updatePrices(prices: RolePrice[]): Observable<any> {
    return this.http.put(this.updateUrl, prices);
  }
}

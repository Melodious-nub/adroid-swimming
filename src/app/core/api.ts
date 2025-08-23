import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pool, PoolResponse } from '../models/pool.model';

@Injectable({
  providedIn: 'root'
})
export class Api {
  private readonly baseUrl = 'https://adroid-swimming-backend.onrender.com/api';

  constructor(private http: HttpClient) {}

  getPools(): Observable<PoolResponse> {
    return this.http.get<PoolResponse>(`${this.baseUrl}/pools`);
  }

  postPool(pool: Pool): Observable<Pool> {
    return this.http.post<Pool>(`${this.baseUrl}/pools`, pool);
  }

  putPool(pool: Pool): Observable<Pool> {
    return this.http.put<Pool>(`${this.baseUrl}/pools/${pool._id}`, pool);
  }

  deletePool(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/pools/${id}`);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pool, PoolResponse } from '../models/pool.model';

@Injectable({
  providedIn: 'root'
})
export class Api {
  private readonly baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, data);
  }

  getPools(): Observable<PoolResponse> {
    return this.http.get<PoolResponse>(`${this.baseUrl}/pools`);
  }

  searchPools(q: string): Observable<PoolResponse> {
    return this.http.get<PoolResponse>(`${this.baseUrl}/pools/search`, { params: { q } });
  }

  postPool(pool: Pool): Observable<Pool> {
    return this.http.post<Pool>(`${this.baseUrl}/pools`, pool);
  }

  putPool(pool: Pool): Observable<Pool> {
    return this.http.put<Pool>(`${this.baseUrl}/pools/${pool.id}`, pool);
  }

  deletePool(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/pools/${id}`);
  }
}

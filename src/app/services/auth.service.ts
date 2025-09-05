import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { Api } from '../core/api';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenStorageKey = 'auth_token';
  private readonly userStorageKey = 'auth_user';

  private readonly router = inject(Router);
  private readonly api = inject(Api);

  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  readonly isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.api.login(credentials).pipe(
      tap((response: any) => {
        const user: AuthUser | undefined = response?.data;
        if (user?.token) {
          this.setSession(user);
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  logout(): void {
    try {
      localStorage.removeItem(this.tokenStorageKey);
      localStorage.removeItem(this.userStorageKey);
    } finally {
      this.isAuthenticatedSubject.next(false);
      this.router.navigate(['/login']);
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenStorageKey);
  }

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(this.userStorageKey);
    try {
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  private setSession(user: AuthUser): void {
    localStorage.setItem(this.tokenStorageKey, user.token);
    localStorage.setItem(this.userStorageKey, JSON.stringify(user));
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem(this.tokenStorageKey);
    // Basic presence check; backend should validate on use. Extend with expiry decode if needed.
    return !!token;
  }
}



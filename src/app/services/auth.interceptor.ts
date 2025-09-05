import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  // Do not attach token to login request
  const isLogin = /\/login(\?|$)/.test(req.url);
  if (!token || isLogin) {
    return next(req);
  }

  const authorized = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
  return next(authorized).pipe(
    catchError((err) => {
      if (err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403)) {
        auth.logout();
      }
      return throwError(() => err);
    })
  );
};



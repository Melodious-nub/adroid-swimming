import { Routes } from '@angular/router';
import { PoolList } from './components/pool-list/pool-list';
import { Login } from './auth/login/login';
import { authGuard } from './services/auth.guard';
import { noAuthGuard } from './services/no-auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login, canActivate: [noAuthGuard] },
  { path: 'pools', component: PoolList, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }
];

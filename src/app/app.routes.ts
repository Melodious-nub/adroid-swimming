import { Routes } from '@angular/router';
import { PoolList } from './components/pool-list/pool-list';

export const routes: Routes = [
  { path: '', component: PoolList },
  { path: '**', redirectTo: '' }
];

import { Routes } from '@angular/router';
import { Bookcase } from './bookcase/bookcase';

export const routes: Routes = [
  { path: '', redirectTo: 'bookcase', pathMatch: 'full' },
  {
    path: 'bookcase',
    component: Bookcase,
  },
];

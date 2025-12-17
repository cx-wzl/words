import { Routes } from '@angular/router';
import { Bookcase } from './bookcase/bookcase';
import { Spell } from './spell/spell';

export const routes: Routes = [
  { path: '', redirectTo: 'spell', pathMatch: 'full' },
  { path: 'spell', component: Spell },
  {
    path: 'bookcase',
    component: Bookcase,
  },
];

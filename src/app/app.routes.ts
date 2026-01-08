import { Routes } from '@angular/router';
import { Main } from './main/main';
import { Library } from './student/library/library';
import { Spell } from './student/spell/spell';
import { Learn } from './student/learn/learn';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'student/main',
    pathMatch: 'full',
  },
  { path: 'student/main', component: Main },
  { path: 'student/learn', component: Learn },
  { path: 'student/spell', component: Spell },
  { path: 'student/library', component: Library },
];

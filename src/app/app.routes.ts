import { Routes } from '@angular/router';
import { Main } from './main/main';
import { Library } from './student/library/library';
import { Spell } from './student/spell/spell';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'student/spell',
    pathMatch: 'full',
  },
  { path: 'student/main', component: Main },
  { path: 'student/spell', component: Spell },
  { path: 'student/library', component: Library },
];

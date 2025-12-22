import { Routes } from '@angular/router';
import { Bookcase } from './teacher/bookcase/bookcase';
import { Spell } from './student/spell/spell';

export const routes: Routes = [
  { path: '', redirectTo: 'student/spell', pathMatch: 'full' },
  { path: 'student/spell', component: Spell },
  {
    path: 'teacher/bookcase',
    component: Bookcase,
  },
];

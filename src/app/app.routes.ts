import { Routes } from '@angular/router';
import { Bookcase } from './teacher/bookcase/bookcase';
import { Main } from './main/main';
import { Spell } from './student/spell/spell';
import { Search } from './teacher/search/search';
import { Library } from './student/library/library';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'student/main',
    pathMatch: 'full',
  },
  { path: 'student/main', component: Main },
  { path: 'student/spell', component: Spell },
  { path: 'student/library', component: Library },
  { path: 'teacher/bookcase', component: Bookcase },
  { path: 'teacher/search', component: Search },
];

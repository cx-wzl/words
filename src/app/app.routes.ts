import { Routes } from '@angular/router';
import { Bookcase } from './teacher/bookcase/bookcase';
import { Main } from './main/main';
import { Spell } from './student/spell/spell';
import { Search } from './teacher/search/search';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'student/spell',
    pathMatch: 'full',
  },
  {
    path: '',
    component: Main,
    children: [
      { path: 'student/spell', component: Spell },
      { path: 'teacher/bookcase', component: Bookcase },
      { path: 'teacher/search', component: Search },
    ],
  },
];

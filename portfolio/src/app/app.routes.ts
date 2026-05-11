import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'projects',
    loadComponent: () => import('./pages/projects/projects.component').then(m => m.ProjectsComponent),
  },
  {
    path: 'blog',
    loadComponent: () => import('./pages/blog/blog-list.component').then(m => m.BlogListComponent),
  },
  {
    path: 'blog/:slug',
    loadComponent: () => import('./pages/blog/blog-post.component').then(m => m.BlogPostComponent),
  },
  {
    path: 'cv',
    loadComponent: () => import('./pages/cv/cv.component').then(m => m.CvComponent),
  },
  {
    path: 'chat',
    loadComponent: () => import('./pages/chat/chat.component').then(m => m.ChatComponent),
  },
  {
    path: 'access',
    loadComponent: () => import('./pages/access/access.component').then(m => m.AccessComponent),
  },
  { path: '**', redirectTo: '' },
];

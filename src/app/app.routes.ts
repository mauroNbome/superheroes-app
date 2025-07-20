import { Routes } from '@angular/router';

export const routes: Routes = [
  // Default route - Hero list
  {
    path: '',
    loadComponent: () => import('./components/hero-list/hero-list.component').then(m => m.HeroListComponent),
    title: 'Súper Héroes'
  },
  
  // Hero detail route
  {
    path: 'hero/:id',
    loadComponent: () => import('./components/hero-detail/hero-detail.component').then(m => m.HeroDetailComponent),
    title: 'Detalle del Héroe'
  },
  
  // Wildcard route - Redirect to home
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

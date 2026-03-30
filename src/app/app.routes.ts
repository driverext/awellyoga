import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { RetreatsComponent } from './pages/retreats/retreats.component';
import { RetreatDetailsComponent } from './pages/retreat-details/retreat-details.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('../app/pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'about', loadComponent: () => import('../app/pages/about/about.component').then(m => m.AboutComponent) },
  { path: 'offerings', loadComponent: () => import('../app/pages/offerings/offerings.component').then(m => m.OfferingsComponent) },
  { path: 'studio', loadComponent: () => import('../app/pages/studio/studio.component').then(m => m.StudioComponent) },
  { path: 'ytt', loadComponent: () => import('../app/pages/ytt/ytt.component').then(m => m.YttComponent) },
  { path: 'workshops', loadComponent: () => import('../app/pages/workshops/workshops.component').then(m => m.WorkshopsComponent) },
  { path: 'retreats', component: RetreatsComponent },
  { path: 'retreats/:id', component: RetreatDetailsComponent },
  { path: 'recipes', loadComponent: () => import('../app/pages/recipes/recipes.component').then(m => m.RecipesComponent) },
  { path: 'blog', loadComponent: () => import('../app/pages/blog/blog.component').then(m => m.BlogComponent) },
  { path: 'shop', loadComponent: () => import('../app/pages/shop/shop.component').then(m => m.ShopComponent) },
  { path: 'payment-success', loadComponent: () => import('../app/pages/payment-success/payment-success.component').then(m => m.PaymentSuccessComponent) },
  { path: '**', redirectTo: '/home' }
];

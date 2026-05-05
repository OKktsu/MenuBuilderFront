import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './pages/home/home.component';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { ItemFormComponent } from './pages/items/item-form/item-form.component';
import { ItemListComponent } from './pages/items/item-list/item-list.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'signup', component: SignupComponent, canActivate: [guestGuard] },
  { path: 'convite/:token', loadComponent: () => import('./pages/aceitar-convite/aceitar-convite.component').then(m => m.AceitarConviteComponent) },
  { path: 'menu/:slug', loadComponent: () => import('./pages/public-menu/public-menu.component').then(m => m.PublicMenuComponent) },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'items/new', component: ItemFormComponent },
      { path: 'items/edit/:id', component: ItemFormComponent },
      { path: 'items', component: ItemListComponent },
      { path: 'builder/:id', loadComponent: () => import('./pages/menu-builder/menu-builder.component').then(m => m.MenuBuilderComponent) },
      { path: 'builder', loadComponent: () => import('./pages/menu-builder/menu-builder.component').then(m => m.MenuBuilderComponent) },
      { path: 'categories', loadComponent: () => import('./pages/categories/categories.component').then(m => m.CategoriesComponent) },
      { path: 'analytics', loadComponent: () => import('./pages/analytics/analytics.component').then(m => m.AnalyticsComponent) },
      { path: 'empresa', loadComponent: () => import('./pages/empresa/empresa.component').then(m => m.EmpresaComponent) },
      { path: 'cargos', loadComponent: () => import('./pages/cargos/cargos.component').then(m => m.CargosComponent) },
      { path: 'funcionarios', loadComponent: () => import('./pages/funcionarios/funcionarios.component').then(m => m.FuncionariosComponent) },
      { path: 'cozinha', loadComponent: () => import('./pages/cozinha/cozinha.component').then(m => m.CozinhaComponent) },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ]
  },
  { path: '**', redirectTo: 'home' }
];

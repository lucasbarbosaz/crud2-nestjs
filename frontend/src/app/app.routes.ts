import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login.page';
import { ClientsListPage } from './pages/clients-list/clients-list.page';
import { ClientsFormPage } from './pages/clients-form/clients-form.page';
import { ProductsListPage } from './pages/products-list/products-list.page';
import { ProductsFormPage } from './pages/products-form/products-form.page';
import { OrdersListPage } from './pages/orders-list/orders-list.page';
import { OrdersFormPage } from './pages/orders-form/orders-form.page';
import { authGuard } from './core/guards/auth.guard';
import { rolesGuard } from './core/guards/roles.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPage, canActivate: [guestGuard] },

  {
    path: 'clientes',
    component: ClientsListPage,
    canActivate: [authGuard, rolesGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: 'clientes/novo',
    component: ClientsFormPage,
    canActivate: [authGuard, rolesGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: 'clientes/:id/editar',
    component: ClientsFormPage,
    canActivate: [authGuard, rolesGuard],
    data: { roles: ['ADMIN'] },
  },

  {
    path: 'produtos',
    component: ProductsListPage,
    canActivate: [authGuard, rolesGuard],
    data: { roles: ['ADMIN', 'USUARIO'] },
  },
  {
    path: 'produtos/novo',
    component: ProductsFormPage,
    canActivate: [authGuard, rolesGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: 'produtos/:id/editar',
    component: ProductsFormPage,
    canActivate: [authGuard, rolesGuard],
    data: { roles: ['ADMIN'] },
  },

  {
    path: 'pedidos',
    component: OrdersListPage,
    canActivate: [authGuard, rolesGuard],
    data: { roles: ['ADMIN', 'USUARIO'] },
  },
  {
    path: 'pedidos/novo',
    component: OrdersFormPage,
    canActivate: [authGuard, rolesGuard],
    data: { roles: ['ADMIN', 'USUARIO'] },
  },
];

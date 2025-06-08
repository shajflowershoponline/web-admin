import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './guard/auth.guard';
import { ProfileComponent } from './pages/profile/profile.component';
import { FeaturesComponent } from './pages/features/features.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { NoAccessComponent } from './pages/no-access/no-access.component';
import { AuthComponent } from './pages/auth/auth.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'auth', pathMatch: 'full', redirectTo: 'auth/login' },
  { path: 'profile', pathMatch: 'full', redirectTo: 'profile/edit' },

  {
    path: '',
    component: FeaturesComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        canActivate: [AuthGuard],
        data: { title: 'Dashboard' },
        loadChildren: () =>
          import('./pages/features/dashboard/dashboard.module').then(
            (m) => m.DashboardModule
          ),
      },
      { path: 'orders',
        canActivate: [AuthGuard],
        data: { title: 'Orders' },
        loadChildren: () => import('./pages/features/order/order.module').then(m => m.OrderModule)
      },
      {
        path: 'customer-user',
        canActivate: [AuthGuard],
        data: { title: 'Customer', group: 'Customer Management' },
        loadChildren: () =>
          import('./pages/features/customer-user/customer-user.module').then(
            (m) => m.CustomerUserModule
          ),
      },
      {
        path: 'category',
        canActivate: [AuthGuard],
        data: { title: 'Category', group: 'Product Management' },
        loadChildren: () =>
          import('./pages/features/category/category.module').then(
            (m) => m.CategoryModule
          ),
      },
      {
        path: 'product',
        canActivate: [AuthGuard],
        data: { title: 'Product', group: 'Product Management' },
        loadChildren: () =>
          import('./pages/features/product/product.module').then(
            (m) => m.ProductModule
          ),
      },
      {
        path: 'collection',
        canActivate: [AuthGuard],
        data: { title: 'Collection', group: 'Product Management' },
        loadChildren: () =>
          import('./pages/features/collection/collection.module').then(
            (m) => m.CollectionModule
          ),
      },
      {
        path: 'gift-add-ons',
        canActivate: [AuthGuard],
        data: { title: 'Gift Add Ons', group: 'Product Management' },
        loadChildren: () =>
          import('./pages/features/gift-add-ons/gift-add-ons.module').then(
            (m) => m.GiftAddOnsModule
          ),
      },
      {
        path: 'discounts',
        canActivate: [AuthGuard],
        data: { title: 'Discounts', group: 'Product Management' },
        loadChildren: () =>
          import('./pages/features/discounts/discounts.module').then(
            (m) => m.DiscountsModule
          ),
      },
      {
        path: 'staff-access',
        canActivate: [AuthGuard],
        data: { title: 'Staff Access', group: 'User Management' },
        loadChildren: () =>
          import('./pages/features/staff-access/staff-access.module').then(
            (m) => m.StaffAccessModule
          ),
      },
      {
        path: 'staff-user',
        canActivate: [AuthGuard],
        data: { title: 'Staff User', group: 'User Management' },
        loadChildren: () =>
          import('./pages/features/staff-user/staff-user.module').then((m) => m.StaffUserModule),
      },
      {
        path: 'system-config',
        canActivate: [AuthGuard],
        data: { title: 'System Config', group: 'SystemConfig' },
        loadChildren: () =>
          import('./pages/features/system-config/system-config.module').then((m) => m.SystemConfigModule),
      }
    ],
  },
  {
    path: 'profile',
    component: ProfileComponent,
    children: [
      {
        path: 'edit',
        data: { title: 'Edit profile', profile: true },
        loadChildren: () =>
          import('./pages/profile/edit-profile/edit-profile.module').then(
            (m) => m.EditProfileModule
          ),
      },
      {
        path: 'change-password',
        data: { title: 'Change Password', profile: true },
        loadChildren: () =>
          import(
            './pages/profile/change-password/change-password.module'
          ).then((m) => m.ChangePasswordModule),
      },
    ],
  },
  {
    path: 'auth',
    component: AuthComponent,
    children: [
      {
        path: 'login',
        data: { title: 'Login' },
        loadChildren: () =>
          import('./pages/auth/login/login.module').then((m) => m.LoginModule),
      },
    ],
  },
  {
    path: 'no-access',
    component: NoAccessComponent,
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerUserComponent } from './customer-user.component';
import { CustomerUserDetailsComponent } from './customer-user-details/customer-user-details.component';

export const routes: Routes = [
  {
    path: '',
    component: CustomerUserComponent,
    data: { title: "Customer"}
  },
  {
    path: ':customerUserCode',
    component: CustomerUserDetailsComponent,
    data: { title: "Customer", details: true }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerUserRoutingModule { }

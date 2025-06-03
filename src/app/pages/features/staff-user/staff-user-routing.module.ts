import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StaffUserDetailsComponent } from './staff-user-details/staff-user-details.component';
import { StaffUserComponent } from './staff-user.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: StaffUserComponent,
    data: { title: "Staff User"}
  },
  {
    path: 'add',
    component: StaffUserDetailsComponent,
    data: { title: "New Staff User", details: true, isNew: true}
  },
  {
    path: ':staffUserCode',
    component: StaffUserDetailsComponent,
    data: { title: "Staff User", details: true }
  },
  {
    path: ':staffUserCode/edit',
    component: StaffUserDetailsComponent,
    data: { title: "Staff User", details: true, edit: true }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaffUserRoutingModule { }

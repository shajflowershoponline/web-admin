import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaffAccessComponent } from './staff-access.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { StaffAccessDetailsComponent } from './staff-access-details/staff-access-details.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { StaffAccessFormComponent } from './staff-access-form/staff-access-form.component';

export const routes: Routes = [
  {
    path: '',
    component: StaffAccessComponent,
    pathMatch: 'full',
    data: { title: "Staff Access" }
  },
  {
    path: 'add',
    component: StaffAccessDetailsComponent,
    data: { title: "New Staff Access", details: true, isNew: true}
  },
  {
    path: ':staffAccessCode',
    component: StaffAccessDetailsComponent,
    data: { title: "Staff Access", details: true }
  },
  {
    path: ':staffAccessCode/edit',
    component: StaffAccessDetailsComponent,
    data: { title: "Staff Access", details: true, edit: true }
  },
];


@NgModule({
  declarations: [
    StaffAccessComponent,
    StaffAccessDetailsComponent,
    StaffAccessFormComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MaterialModule,
    NgxSkeletonLoaderModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SharedModule
  ]
})
export class StaffAccessModule { }

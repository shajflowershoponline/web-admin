import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerUserRoutingModule } from './customer-user-routing.module';
import { CustomerUserComponent } from './customer-user.component';
import { Routes } from '@angular/router';
import { CustomerUserDetailsComponent } from './customer-user-details/customer-user-details.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MaterialModule } from 'src/app/shared/material/material.module';

@NgModule({
  declarations: [
    CustomerUserComponent,
    CustomerUserDetailsComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MaterialModule,
    NgxSkeletonLoaderModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    CustomerUserRoutingModule,
  ]
})
export class CustomerUserModule { }

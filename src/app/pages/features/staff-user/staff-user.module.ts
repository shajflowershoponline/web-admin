import { NgModule } from '@angular/core';
import { AsyncPipe, CommonModule, NgFor } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { SharedModule } from 'src/app/shared/shared.module';
import { StaffUserDetailsComponent } from './staff-user-details/staff-user-details.component';
import { StaffUserComponent } from './staff-user.component';
import { StaffUserChangePasswordComponent } from './staff-user-details/staff-change-password/staff-user-change-password.component';
import { StaffUserRoutingModule } from './staff-user-routing.module';

@NgModule({
    declarations: [StaffUserComponent, StaffUserDetailsComponent, StaffUserChangePasswordComponent],
    imports: [
        CommonModule,
        FlexLayoutModule,
        MaterialModule,
        NgxSkeletonLoaderModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        StaffUserRoutingModule
    ]
})
export class StaffUserModule { }

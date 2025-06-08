import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { GiftAddOnsRoutingModule } from '../gift-add-ons/gift-add-ons-routing.module';
import { SystemConfigComponent } from './system-config.component';
import { SystemConfigRoutingModule } from './system-config-routing.module';
import { LocationMapViewerComponent } from 'src/app/shared/location-map-viewer/location-map-viewer.component';



@NgModule({
  declarations: [
    SystemConfigComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MaterialModule,
    NgxSkeletonLoaderModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    SystemConfigRoutingModule,
    LocationMapViewerComponent
  ]
})
export class SystemConfigModule { }

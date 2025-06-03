import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GiftAddOnsRoutingModule } from './gift-add-ons-routing.module';
import { GiftAddOnsComponent } from './gift-add-ons.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { GiftAddOnsDetailsComponent } from './gift-add-ons-details/gift-add-ons-details.component';


@NgModule({
  declarations: [
    GiftAddOnsComponent, GiftAddOnsDetailsComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MaterialModule,
    NgxSkeletonLoaderModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    GiftAddOnsRoutingModule,
    SharedModule,
  ]
})
export class GiftAddOnsModule { }

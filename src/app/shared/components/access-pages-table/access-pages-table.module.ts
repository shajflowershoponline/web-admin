import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccessPagesTableComponent } from './access-pages-table.component';
import { MaterialModule } from '../material/material.module';



@NgModule({
  declarations: [AccessPagesTableComponent],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports: [AccessPagesTableComponent]
})
export class AccessPagesTableModule { }

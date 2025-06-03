import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedComponentsModule } from './components/shared-components.module';

@NgModule({
  declarations: [
  ],
  imports: [
    SharedComponentsModule,
    CommonModule,
  ],
  exports: [SharedComponentsModule]
})
export class SharedModule { }

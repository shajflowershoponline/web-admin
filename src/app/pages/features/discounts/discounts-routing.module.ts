import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DiscountsComponent } from './discounts.component';
import { DiscountsDetailsComponent } from './discounts-details/discounts-details.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: DiscountsComponent ,
    data: { title: "Discounts" }
  },
  {
    path: 'add',
    component: DiscountsDetailsComponent,
    data: { title: "New Discount", details: true, isNew: true}
  },
  {
    path: ':discountId',
    component: DiscountsDetailsComponent,
    data: { title: "Discounts", details: true }
  },
  {
    path: ':discountId/edit',
    component: DiscountsDetailsComponent,
    data: { title: "Discounts", details: true, edit: true }
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DiscountsRoutingModule { }

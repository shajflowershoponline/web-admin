import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GiftAddOnsComponent } from './gift-add-ons.component';
import { GiftAddOnsDetailsComponent } from './gift-add-ons-details/gift-add-ons-details.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: GiftAddOnsComponent ,
    data: { title: "Gift Add Ons" }
  },
  {
    path: 'add',
    component: GiftAddOnsDetailsComponent,
    data: { title: "New Gift Add Ons", details: true, isNew: true}
  },
  {
    path: ':giftAddOnId',
    component: GiftAddOnsDetailsComponent,
    data: { title: "Gift Add Ons", details: true }
  },
  {
    path: ':giftAddOnId/edit',
    component: GiftAddOnsDetailsComponent,
    data: { title: "Gift Add Ons", details: true, edit: true }
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GiftAddOnsRoutingModule { }

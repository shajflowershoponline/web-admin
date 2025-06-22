import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderComponent } from './order.component';
import { OrderDetailsComponent } from './order-details/order-details.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: OrderComponent ,
    data: { title: "Order" }
  },
  {
    path: ':orderCode',
    component: OrderDetailsComponent,
    data: { title: "Order", details: true }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrderRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductComponent } from './product.component';
import { ProductDetailsComponent } from './product-details/product-details.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: ProductComponent ,
    data: { title: "Product" }
  },
  {
    path: 'add',
    component: ProductDetailsComponent,
    data: { title: "New Product", details: true, isNew: true}
  },
  {
    path: ':sku',
    component: ProductDetailsComponent,
    data: { title: "Product", details: true }
  },
  {
    path: ':sku/edit',
    component: ProductDetailsComponent,
    data: { title: "Product", details: true, edit: true }
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductRoutingModule { }

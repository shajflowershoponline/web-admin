import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoryComponent } from './category.component';
import { CategoryDetailsComponent } from './category-details/category-details.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: CategoryComponent ,
    data: { title: "Category" }
  },
  {
    path: 'add',
    component: CategoryDetailsComponent,
    data: { title: "New Category", details: true, isNew: true}
  },
  {
    path: ':categoryId',
    component: CategoryDetailsComponent,
    data: { title: "Category", details: true }
  },
  {
    path: ':categoryId/edit',
    component: CategoryDetailsComponent,
    data: { title: "Category", details: true, edit: true }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CategoryRoutingModule { }

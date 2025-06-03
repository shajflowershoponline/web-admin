import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CollectionComponent } from './collection.component';
import { CollectionDetailsComponent } from './collection-details/collection-details.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: CollectionComponent,
    data: { title: 'Collection' }
  },
  {
    path: 'add',
    component: CollectionDetailsComponent,
    data: { title: "New Collection", details: true, isNew: true }
  },
  {
    path: ':collectionId',
    component: CollectionDetailsComponent,
    data: { title: "Collection", details: true }
  },
  {
    path: ':collectionId/edit',
    component: CollectionDetailsComponent,
    data: { title: "Collection", details: true, edit: true }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CollectionRoutingModule { }

import { File } from "././file";
import { ProductCollection } from "././product-collection";
import { Discounts } from "./discounts";
export class Collection {
  collectionId: string;
  sequenceId: string;
  name: string;
  desc: string;
  productCount: string;
  active: boolean;
  thumbnailFile: File;
  isSale: boolean;
  isFeatured: boolean;
  saleFromDate: Date;
  saleDueDate: Date;
  productCollections: ProductCollection[];
  selectedDiscounts: Discounts[];
}

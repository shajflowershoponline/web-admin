import { Category } from "././category";
import { File } from "././file";
import { ProductCollection } from "././product-collection";
import { ProductImage } from "././product-image";
import { Discounts } from "./discounts";
import { GiftAddOns } from "./gift-add-ons";
export class Product {
  productId: string;
  sku: string | null;
  name: string;
  shortDesc: string;
  price: string;
  color: string;
  discountPrice: string;
  size: string;
  longDesc: string;
  active: boolean;
  category: Category;
  thumbnailFile: File;
  productCollections: ProductCollection[];
  productImages: ProductImage[];
  selectedGiftAddOns: GiftAddOns[];
  selectedDiscounts: Discounts[];
}

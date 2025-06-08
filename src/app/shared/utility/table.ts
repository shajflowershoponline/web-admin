export class ColumnDefinition {
  name: string;
  label: string;
  apiNotation?: string;
  sticky?: boolean;
  style?: ColumnStyle;
  controls?: boolean;
  disableSorting?: boolean;
  format?: {
    type: "currency" | "date" | "date-time" | "number" | "custom" | "image";
    custom: string;
  };
  hide?: boolean;
  type?: "string" | "boolean" | "date" | "number" = "string";
  filterOptions: ColumnDefinitionFilterOptions;
  urlPropertyName?: string;
  filter: any;
}

export class ColumnDefinitionFilterOptions {
  placeholder?: string;
  enable?: boolean;
  type?: "text" | "option" | "option-yes-no" | "date" | "date-range" | "number" | "number-range" | "precise";
};
export class ColumnStyle {
  width: string;
  left: string;
}

export class TableColumnBase {
  menu: any[] = [];
}

export class StaffUsersTableColumn {
  userName: string;
  name: string;
  enable: boolean;
  userProfilePic?: string;
  url?: string;
}

export class StaffUserTableColumn {
  staffUserCode?: string;
  name?: string;
  userName?: string;
}

export class StaffAccessTableColumn {
  staffAccessId: string;
  staffAccessCode: string;
  name?: string;
  url?: string;
}

export class CustomerUserTableColumn {
  url?: string;
  customerUserCode?: string;
  name?: string;
  email?: string;
}

export class CategoryTableColumn {
  categoryId?: string;
  sequenceId?: string;
  name?: string;
  desc?: string;
  thumbnailUrl?: string;
  productCount?: string
}

export class GiftAddOnsTableColumn {
  giftAddOnId?: string;
  name?: string;
  description?: string;
  thumbnailUrl?: string;
}

export class DiscountsTableColumn {
  discountId?: string;
  promoCode?: string;
  description?: string;
  type?: string;
  value?: string;
  thumbnailUrl?: string;
}

export class CollectionTableColumn {
  collectionId?: string;
  sequenceId?: string;
  name?: string;
  desc?: string;
  thumbnailUrl?: string;
  productCount?: string;
  saleDueDate?: string;
  isSale: boolean;
  isFeatured: boolean;
}

export class ProductTableColumn {
  productId?: string;
  sku?: string;
  name?: string;
  price?: string;
  size?: string;
  shortDesc?: string;
  category?: string;
  url?: string;
}

export class OrderTableColumn {
  orderId?: string;
  orderCode?: string;
  name?: string;
  paymentMethod?: string;
  deliveryAddress?: string;
  total?: string;
  status?: string;
  createdAt?: string;
  url?: string;
}

import { CustomerUser } from "./customer-user";
import { Product } from "./product";
export class OrderItems {
  orderItemId: string;
  quantity: string;
  price: string;
  totalAmount: string;
  active: boolean;
  order: Order;
  product: Product;
}

export class Order {
  orderId: string;
  orderCode: string | null;
  name: string;
  mobileNumber: string | null;
  email: string | null;
  paymentMethod: string;
  deliveryAddress: string;
  deliveryAddressLandmark: string | null;
  deliveryAddressCoordinates: object;
  deliveryFee: string;
  promoCode: string | null;
  subtotal: string;
  discount: string;
  total: string;
  specialInstructions: string | null;
  notesToRider: string | null;
  createdAt: Date;
  deliveryStateAt: Date | null;
  cancelledStateAt: Date | null;
  completedStateAt: Date | null;
  cancelReason: string | null;
  active: boolean;
  status: string;
  customerUser: CustomerUser;
  orderItems: OrderItems[];
}

export type Category = 'ready' | 'handmade';
export type Material = 'wood' | 'cardboard' | 'fabric';
export type OrderStatus = 'new' | 'in_progress' | 'delivered' | 'completed' | 'cancelled';
export type PaymentMethod = string;

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  sizePoints: number;
  image: string;
  description: string;
  available?: boolean;
  sizes?: string[];
  colors?: string[];
}

export interface PackagingSizes {
  small?: number;
  medium?: number;
  large?: number;
}

export interface Packaging {
  id: string;
  name: string;
  material: Material;
  price: number;
  maxCapacityPoints: number;
  image: string;
  sizes?: PackagingSizes;
}

export interface ProductCartItem {
  type: 'product';
  id: string;
  productId: string;
  quantity: number;
  customizations?: {
    size?: string;
    color?: string;
    uploadedImage?: string;
    note?: string;
  };
}

export interface CustomBoxCartItem {
  type: 'custom_box';
  id: string;
  packagingId: string;
  boxSize?: 'small' | 'medium' | 'large';
  gifts: Array<{ productId: string; quantity: number }>;
  message?: string;
  recipientName?: string;
  senderName?: string;
  quantity: number;
  totalPrice: number;
  totalPoints: number;
}

export type CartItem = ProductCartItem | CustomBoxCartItem;

export interface Order {
  id: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    governorate: string;
  };
  items: CartItem[];
  paymentMethod: PaymentMethod;
  paymentScreenshot?: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  fromSpecialRequest?: string;
}

export interface BoxSize {
  name: string;
  value: 'small' | 'medium' | 'large';
  capacityMultiplier: number;
  priceAdd: number;
}

export interface SpecialRequest {
  id: string;
  name: string;
  whatsapp: string;
  description: string;
  referenceImages: string[];
  createdAt: string;
  convertedToOrderId?: string;
}

export interface CustomPaymentMethod {
  id: string;
  name: string;
  link: string;
}

export interface AppSettings {
  adminUsername: string;
  adminPassword: string;
  paymentLinks: {
    instapay: string;
    vodafoneCash: string;
    custom: CustomPaymentMethod[];
  };
  contact: {
    address: string;
    phone: string;
    email: string;
    facebook: string;
    instagram: string;
    whatsapp: string;
    twitter: string;
  };
}

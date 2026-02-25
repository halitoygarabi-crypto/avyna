
export interface ProductColor {
  name: string;
  hex: string;
}

export interface FabricProperties {
  type: string;           // e.g. "Kadife", "Keten", "Deri", "Chenille"
  composition: string;    // e.g. "80% Polyester, 20% Pamuk"
  pillResistance: string; // e.g. "Yüksek", "Orta", "Düşük"
  cleaningInstructions: string; // e.g. "Kuru Temizleme"
  origin: string;         // e.g. "İtalya", "Türkiye"
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  images: string[];
  videoUrl?: string; // optional video file
  modelUrl: string; // .glb file
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  features?: string[];
  colors?: ProductColor[];
  fabricProperties?: FabricProperties;
  stock: number;
}


export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export enum ViewMode {
  HOME = 'home',
  ADMIN = 'admin',
  CONSULTANT = 'consultant',
  DETAIL = 'detail',
  CART = 'cart',
  CHECKOUT = 'checkout',
  TRIAL_ROOM = 'trial_room',
  ORDERS = 'orders',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAIL = 'payment_fail',
  INFO_DELIVERY = 'info_delivery',
  INFO_WARRANTY = 'info_warranty',
  CONTACT = 'contact',
  INFO_PRIVACY = 'info_privacy',
  INFO_DISTANCE_SALES = 'info_distance_sales'
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
}

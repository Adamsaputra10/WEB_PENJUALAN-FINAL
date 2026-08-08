export type Language = 'EN' | 'ID';

export type Theme = 'dark' | 'light';

export type NavTab = 'HOME' | 'PRODUCTS' | 'CART' | 'TRACK_ORDER';

export type Category = 'DRINKS' | 'SNACKS' | 'FOOD' | 'MERCH' | 'HARDWARE' | 'PERIPHERALS' | 'ACCESSORIES';

export type Condition = 'MINT IN BOX' | 'REFURBISHED' | 'PARTS ONLY' | 'FRESH MADE' | 'LIMITED EDITION';

export type PaymentMethod = 'VA' | 'QRIS' | 'COD';

export interface Review {
  id: string;
  username: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  sku?: string;
  name: string;
  nameId?: string;
  filename: string; // e.g. coffee_filter.dat
  price: number;
  category: Category;
  condition: Condition;
  stock: number;
  rating: number;
  reviewCount: number;
  description: string;
  descriptionId?: string;
  images: string[];
  specs: ProductSpec[];
  reviews: Review[];
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Courier {
  id: string;
  name: string;
  estimatedDays: string;
  price: number;
}

export interface ShippingDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  notes?: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  shipping: ShippingDetails;
  courier: Courier;
  paymentMethod: PaymentMethod;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: 'ORDER PLACED' | 'PACKING IN ANTI-STATIC' | 'DISPATCHED' | 'IN TRANSIT' | 'DELIVERED';
  trackingNumber: string;
  vaNumber?: string;
}

export interface FilterState {
  searchQuery: string;
  categories: Category[];
  conditions: Condition[];
  inStockOnly: boolean;
  maxPrice: number;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'rating';
}

export interface UserProfile {
  name: string;
  email: string;
  joinDate?: string;
}


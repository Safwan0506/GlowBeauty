export interface Client {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password_hash: string;
  created_at: string;
}

export interface Category {
  id: string;
  code: string;
  name: string;
  description: string;
  created_at: string;
}

export interface Supplier {
  id: string;
  code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: 'M' | 'F' | null;
  created_at: string;
}

export interface DeliveryPerson {
  id: string;
  code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: 'M' | 'F' | null;
  created_at: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  brand: string;
  skin_type: string;
  acquisition_date: string;
  image_url: string;
  category_id: string | null;
  supplier_id: string | null;
  created_at: string;
  category?: Category;
  supplier?: Supplier;
}

export interface Order {
  id: string;
  code: string;
  client_id: string;
  total_amount: number;
  status: 'pending' | 'validated' | 'refused';
  payment_status: 'pending' | 'paid';
  created_at: string;
  delivery_address?: string;
  stock_updated?: boolean;
  client?: Client;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product?: Product;
}

export interface Delivery {
  id: string;
  order_id: string;
  delivery_person_id: string | null;
  status: 'pending' | 'completed';
  delivery_address?: string;
  created_at: string;
  completed_at: string | null;
  delivery_person?: DeliveryPerson;
  order?: Order;
}

export interface Payment {
  id: string;
  code: string;
  order_id: string;
  client_id: string;
  amount: number;
  payment_method: 'MTN' | 'ORANGE' | null;
  phone_number: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  client?: Client;
}

export interface Favorite {
  id: string;
  client_id: string;
  product_id: string;
  created_at: string;
}

export interface Review {
  id: string;
  client_id: string;
  product_id: string;
  rating: number;
  comment: string;
  created_at: string;
  client?: Client;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ContactForm {
  name: string;
  email: string;
  message: string;
}

export type UserRole = 'admin' | 'client' | null;

export interface AuthState {
  user: Client | null;
  role: UserRole;
  isAuthenticated: boolean;
  isAdmin: boolean;
}


export interface AdminNotification {
  id: string;
  type: 'order' | 'payment' | 'stock' | 'review' | 'client' | 'delivery' | 'promo';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  link?: string;
  created_at: string;
}

export interface Promotion {
  id: string;
  code: string;
  name: string;
  description: string;
  discount_percent: number;
  category_id?: string | null;
  product_id?: string | null;
  start_date: string;
  end_date: string;
  active: boolean;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_percent: number;
  min_amount: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface LoyaltyAccount {
  client_id: string;
  points: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  total_spent: number;
  updated_at: string;
}

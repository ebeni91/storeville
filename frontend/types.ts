export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  is_available: boolean;
  image: string | null;
}

export interface Store {
  id: number;
  name: string;
  slug: string;
  category: string;
  primary_color: string;
  products: Product[];
  
  // 📍 RE-ADD THESE:
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  distance?: number; 

  // 💳 Payment configuration
  payment_methods?: string[];
  payment_accounts?: { [key: string]: string };
}
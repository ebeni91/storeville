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
  
  // 📍 NEW LOCATION FIELDS
  address?: string;          // Optional string
  latitude?: number | null;  // Optional number or null
  longitude?: number | null; // Optional number or null
  distance?: number;         // Optional number (calculated by backend)
}
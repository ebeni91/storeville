export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  is_available: boolean;
}

export interface Store {
  id: number;
  name: string;
  slug: string;
  category: string;
  primary_color: string;
  products: Product[];
}
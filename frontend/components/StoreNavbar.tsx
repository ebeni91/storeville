"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";
import { Store } from "../types";

export default function StoreNavbar({ store }: { store: Store }) {
  const { cartCount } = useCart();

  return (
    <nav
      className="text-white shadow-md sticky top-0 z-50 transition-colors"
      style={{ backgroundColor: store.primary_color || "#000000" }}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href={`/store/${store.slug}`} className="text-2xl font-bold tracking-tight">
          {store.name}
        </Link>
        
        <div className="flex space-x-6 items-center">
          <Link href={`/store/${store.slug}`} className="hover:opacity-80 font-medium">
            Home
          </Link>
          <Link 
            href={`/store/${store.slug}/cart`}
            className="bg-white/20 px-4 py-2 rounded-full hover:bg-white/30 transition flex items-center gap-2"
          >
            <span>🛒</span>
            <span className="font-bold">Cart ({cartCount})</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
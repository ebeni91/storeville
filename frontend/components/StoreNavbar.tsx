"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";
import { ShoppingCart, Store } from "lucide-react";

export default function StoreNavbar({ storeName, slug }: { storeName: string; slug: string }) {
  const { cartCount } = useCart();

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo / Store Name */}
          <Link href={`/store/${slug}`} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform duration-200">
              <Store size={20} />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
              {storeName}
            </span>
          </Link>

          {/* Cart Icon */}
          <div className="flex items-center gap-4">
            <Link 
              href={`/store/${slug}/cart`} 
              className="relative p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200"
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm border-2 border-white transform translate-x-1 -translate-y-1">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
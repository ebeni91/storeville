"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";
import { ShoppingCart, Store, ArrowLeft } from "lucide-react";

export default function StoreNavbar({ storeName, slug }: { storeName: string; slug: string }) {
  const { cartCount } = useCart();

  return (
    // 👇 Ultra-Glass Style
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <Link 
              href="/" 
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-white/10 rounded-full transition-all"
              title="Back to Directory"
            >
              <ArrowLeft size={20} />
            </Link>

            {/* Store Identity */}
            <Link href={`/store/${slug}`} className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-indigo-600/90 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300 backdrop-blur-md">
                <Store size={20} />
              </div>
              <span className="font-extrabold text-xl text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                {storeName}
              </span>
            </Link>
          </div>

          {/* Cart Actions */}
          <div className="flex items-center gap-4">
            <Link 
              href={`/store/${slug}/cart`} 
              className="group relative p-3 rounded-xl hover:bg-white/10 transition-all duration-300"
            >
              <div className="text-slate-600 group-hover:text-indigo-600 transition-colors">
                <ShoppingCart size={24} />
              </div>
              
              {/* Animated Badge */}
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg shadow-indigo-500/30 transform scale-100 animate-bounce">
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
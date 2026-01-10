"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";

export default function OrderSuccessPage() {
  const params = useParams();
  
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 text-center max-w-md w-full relative overflow-hidden">
        
        {/* Background Confetti Effect (CSS only) */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500" />

        <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <CheckCircle size={48} strokeWidth={3} />
        </div>
        
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Order Confirmed!</h1>
        <p className="text-slate-500 mb-8 text-lg">
          Thank you for your purchase. Your order has been placed successfully.
        </p>

        <div className="space-y-3">
          <Link 
            href={`/store/${params.slug}`} 
            className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-lg shadow-lg shadow-indigo-100"
          >
            <ShoppingBag size={20} /> Continue Shopping
          </Link>
          
          {/* <Link 
            href="/dashboard" 
            className="block text-sm text-slate-400 hover:text-indigo-600 font-medium transition py-2"
          >
            View Order History
          </Link> */}
        </div>

      </div>
    </div>
  );
}
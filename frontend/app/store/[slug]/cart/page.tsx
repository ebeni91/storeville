"use client";

import { useCart } from "../../../../context/CartContext";
import { useAuth } from "../../../../context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, CreditCard, ArrowLeft } from "lucide-react";

function getPublicImageUrl(url: string | null) {
  if (!url) return null;
  return url.replace("http://backend:8000", "http://localhost:8000");
}

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, total } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    router.push(`/store/${params.slug}/checkout`);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl p-10 rounded-3xl shadow-sm border border-white/20 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400 backdrop-blur-sm">
            <ShoppingBag size={40} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h1>
          <p className="text-slate-500 mb-8">Looks like you haven't added anything yet.</p>
          <button onClick={() => router.back()} className="btn-primary w-full bg-indigo-600/90 hover:bg-indigo-700/90 backdrop-blur-md">
            <ArrowLeft size={20} /> Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
          <ShoppingBag className="text-indigo-600" /> Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              // Glass Card
              <div key={item.product.id} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 flex gap-4 sm:gap-6 items-center shadow-sm">
                
                {/* Image */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white/20 rounded-xl overflow-hidden flex-shrink-0 border border-white/20">
                  {item.product.image ? (
                    <img 
                      src={getPublicImageUrl(item.product.image) || ""} 
                      alt={item.product.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">📦</div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-slate-900 truncate">{item.product.name}</h3>
                  <p className="text-indigo-600 font-bold mb-3">{item.product.price} ETB</p>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-white/20 rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm">
                      <button 
                        onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                        className="p-2 hover:bg-white/20 transition text-slate-600"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center font-semibold text-sm text-slate-900">{item.quantity}</span>
                      <button 
                         onClick={() => updateQuantity(item.product.id, Math.min(item.product.stock, item.quantity + 1))}
                         className="p-2 hover:bg-white/20 transition text-slate-600"
                         disabled={item.quantity >= item.product.stock}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 text-slate-400 hover:text-red-600 transition rounded-lg hover:bg-red-500/10"
                      title="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Line Total */}
                <div className="hidden sm:block text-right">
                  <p className="font-bold text-slate-900 text-lg">
                    {(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-500">ETB</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 sticky top-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{total.toFixed(2)} ETB</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Taxes (0%)</span>
                  <span>0.00 ETB</span>
                </div>
                <div className="border-t border-white/20 pt-4 flex justify-between items-center">
                  <span className="font-bold text-lg text-slate-900">Total</span>
                  <span className="font-extrabold text-2xl text-indigo-600">{total.toFixed(2)} ETB</span>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                className="btn-primary w-full py-4 text-lg shadow-xl shadow-indigo-500/20 bg-indigo-600/90 hover:bg-indigo-700/90 backdrop-blur-md"
              >
                Proceed to Checkout <ArrowRight size={20} />
              </button>
              
              <p className="text-xs text-center text-slate-400 mt-4 flex items-center justify-center gap-2">
                <CreditCard size={14}/> Secure Checkout
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
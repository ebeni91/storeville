"use client";

import Link from "next/link";
import { useCart } from "../../../../context/CartContext";
import { use, useEffect, useState } from "react";

// Helper hook to avoid hydration mismatch (optional but good practice)
function useHasMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export default function CartPage({ params }: { params: Promise<{ slug: string }> }) {
  const { cart, removeFromCart, cartTotal, clearCart } = useCart();
  const mounted = useHasMounted();

  // Next.js 15: Unwrap params (even if not strictly used, good for structure)
  const resolvedParams = use(params);

  if (!mounted) return <div className="p-10 text-center">Loading cart...</div>;

  if (cart.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
        <Link 
          href={`/store/${resolvedParams.slug}`} 
          className="text-blue-600 underline hover:text-blue-800"
        >
          ← Go back to shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg border p-6">
      <h1 className="text-2xl font-bold mb-6 border-b pb-4">Shopping Cart</h1>

      <div className="space-y-4">
        {cart.map((item) => (
          <div key={item.id} className="flex justify-between items-center py-4 border-b last:border-0">
            <div>
              <h3 className="font-bold text-lg">{item.name}</h3>
              <p className="text-gray-500 text-sm">{item.price} ETB x {item.quantity}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold">
                {(parseFloat(item.price) * item.quantity).toFixed(2)} ETB
              </span>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 hover:text-red-700 text-sm font-semibold"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-gray-50 p-6 rounded-lg flex flex-col items-end">
        <div className="text-xl mb-4">
          Total: <span className="font-bold text-green-700">{cartTotal.toFixed(2)} ETB</span>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={clearCart}
            className="px-6 py-2 text-gray-500 hover:text-gray-700"
          >
            Clear Cart
          </button>
          <button className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 shadow-md">
            Checkout Now
          </button>
        </div>
      </div>
    </div>
  );
}
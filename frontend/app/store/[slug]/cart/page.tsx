"use client";

import Link from "next/link";
// ✅ FIX 1: Correct path (4 dots) and import getBaseUrl
import { useCart } from "../../../../context/CartContext";
import { use, useEffect, useState } from "react";
import { createOrder, getBaseUrl } from "../../../../lib/api";
import { Store } from "../../../../types";

// Helper hook
function useHasMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export default function CartPage({ params }: { params: Promise<{ slug: string }> }) {
  const { cart, removeFromCart, cartTotal, clearCart } = useCart();
  const mounted = useHasMounted();
  const resolvedParams = use(params);

  // checkout states
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");

  const [storeId, setStoreId] = useState<number | null>(null);

  useEffect(() => {
    // ✅ FIX 2: Use getBaseUrl() instead of hardcoded string
    const url = `${getBaseUrl()}/api/stores/${resolvedParams.slug}/`;
    
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Store lookup failed");
        return res.json();
      })
      .then((data) => setStoreId(data.id))
      .catch((err) => console.error("Failed to get store ID", err));
  }, [resolvedParams.slug]);

  const handleCheckout = async () => {
    if (!buyerName || !buyerPhone) {
      alert("Please enter your name and phone number");
      return;
    }
    if (!storeId) {
        alert("Store ID not found. Please refresh.");
        return;
    }

    setIsCheckingOut(true);

    const orderPayload = {
      store: storeId,
      buyer_name: buyerName,
      buyer_phone: buyerPhone,
      total_amount: cartTotal,
      items: cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    try {
      await createOrder(orderPayload);
      setOrderSuccess(true);
      clearCart(); // Clear the cart after success
    } catch (error) {
      alert("Checkout Failed: " + error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!mounted) return <div className="p-10 text-center">Loading cart...</div>;

  // SUCCESS SCREEN
  if (orderSuccess) {
    return (
      <div className="max-w-md mx-auto mt-10 p-8 bg-green-50 rounded-xl text-center border border-green-200">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-green-800 mb-2">Order Placed!</h2>
        <p className="text-green-700 mb-6">
          Thank you, {buyerName}. The store owner will contact you at {buyerPhone} shortly.
        </p>
        <Link 
          href={`/store/${resolvedParams.slug}`} 
          className="bg-green-600 text-white px-6 py-2 rounded-full font-bold hover:bg-green-700"
        >
          Back to Store
        </Link>
      </div>
    );
  }

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

      {/* Cart Items List */}
      <div className="space-y-4 mb-8">
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

      {/* Checkout Form */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="font-bold text-lg mb-4">Checkout Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input 
            type="text" 
            placeholder="Your Name" 
            className="p-3 border rounded"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
          />
          <input 
            type="tel" 
            placeholder="Phone Number (09...)" 
            className="p-3 border rounded"
            value={buyerPhone}
            onChange={(e) => setBuyerPhone(e.target.value)}
          />
        </div>

        <div className="flex flex-col items-end border-t pt-4">
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
            <button 
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 shadow-md disabled:opacity-50"
            >
              {isCheckingOut ? "Placing Order..." : "Confirm Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
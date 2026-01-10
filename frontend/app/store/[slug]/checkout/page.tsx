"use client";

import { useState } from "react";
import { useCart } from "../../../../context/CartContext";
import { useAuth } from "../../../../context/AuthContext";
import { getBaseUrl } from "../../../../lib/api";
// import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, MapPin, Phone, User, CheckCircle, Truck } from "lucide-react";
import { useRouter, useParams } from "next/navigation"; // <--- Add useParams

export default function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { cart, total, clearCart } = useCart();
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const urlParams = useParams();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "Addis Ababa"
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setIsProcessing(true);

    try {
      const items = cart.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      }));

      // Note: We are sending shipping info, but we might need to update the 
      // Backend later to actually save the 'address' field.
      const payload = {
        items,
        buyer_name: formData.name, // <--- ADD THIS LINE!
        buyer_phone: formData.phone,
        shipping_address: `${formData.address}, ${formData.city}`,
      };

      const res = await fetch(`${getBaseUrl()}/api/orders/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        clearCart();
        // Redirect to a specific "Order Success" page or Dashboard
        alert("Order Successfully Placed! 🚚");
        router.push(`/store/${urlParams.slug}/order-success`); 
      } else {
        const errorData = await res.json();
        alert(`Checkout Failed: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error(error);
      alert("Network Error");
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return <div className="p-10 text-center">Your cart is empty.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition">
          <ArrowLeft size={18} className="mr-2" /> Back to Cart
        </button>

        <h1 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
          <CheckCircle className="text-green-500" /> Checkout
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Shipping Form */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Shipping Info Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <MapPin size={20} className="text-indigo-600"/> Shipping Information
              </h2>
              <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input 
                      required
                      type="text" 
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Abebe Bikila"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                      <input 
                        required
                        type="tel" 
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="0911..."
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">City</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                      value={formData.city}
                      onChange={e => setFormData({...formData, city: e.target.value})}
                    >
                      <option>Addis Ababa</option>
                      <option>Adama</option>
                      <option>Hawassa</option>
                      <option>Bahir Dar</option>
                      <option>Mekelle</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Delivery Address</label>
                  <textarea 
                    required
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    placeholder="Sub-city, Woreda, House No. or nearby landmark..."
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </form>
            </div>

            {/* Payment Method Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-indigo-600"/> Payment Method
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border border-indigo-100 bg-indigo-50 rounded-xl cursor-pointer">
                  <input type="radio" name="payment" defaultChecked className="w-5 h-5 text-indigo-600" />
                  <span className="font-bold text-slate-900">Cash on Delivery</span>
                  <Truck size={18} className="ml-auto text-indigo-600"/>
                </label>
                <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-not-allowed opacity-60">
                  <input type="radio" name="payment" disabled className="w-5 h-5" />
                  <span className="font-medium text-slate-500">Telebirr (Coming Soon)</span>
                </label>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary */}
          <div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">{item.quantity}x</span>
                      <span className="text-slate-700 truncate max-w-[120px]">{item.product.name}</span>
                    </div>
                    <span className="font-medium text-slate-900">
                      {(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2 mb-6">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>{total.toFixed(2)} ETB</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Delivery Fee</span>
                  <span>50.00 ETB</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-slate-900 pt-2 border-t border-dashed border-slate-200">
                  <span>Total</span>
                  <span className="text-indigo-600">{(total + 50).toFixed(2)} ETB</span>
                </div>
              </div>

              <button 
                type="submit"
                form="checkout-form" // Links to the form ID above
                disabled={isProcessing}
                className="btn-primary w-full py-4 text-lg shadow-xl shadow-indigo-200"
              >
                {isProcessing ? "Processing..." : "Place Order"}
              </button>
              
              <p className="text-xs text-center text-slate-400 mt-4">
                By placing this order, you agree to our Terms of Service.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
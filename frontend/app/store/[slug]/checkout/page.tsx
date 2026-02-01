"use client";

import { useEffect, useState } from "react";
import { useCart } from "../../../../context/CartContext";
import { useAuth } from "../../../../context/AuthContext";
import { getBaseUrl, fetchStoreBySlug } from "../../../../lib/api";
import { 
  ArrowLeft, CreditCard, MapPin, Phone, User, CheckCircle, 
  Truck, ShoppingBag, X, Copy 
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { cart, total, clearCart } = useCart();
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const urlParams = useParams(); 
  const [storeInfo, setStoreInfo] = useState<any | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "Addis Ababa"
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string>("cod");
  
  // 👇 State to store the Reference Code returned by the API
  const [orderReference, setOrderReference] = useState(""); 

  // Load store info for payment methods
  useEffect(() => {
    const slug = (urlParams as any)?.slug as string;
    if (!slug) return;
    fetchStoreBySlug(slug)
      .then(setStoreInfo)
      .catch(() => setStoreInfo(null));
  }, [urlParams]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Basic validation: ensure account details exist for selected non-COD method
    if (selectedPayment !== "cod") {
      const acct = storeInfo?.payment_accounts?.[selectedPayment];
      if (!acct) {
        alert("Selected payment method is missing account details. Please choose another method or use Cash on Delivery.");
        return;
      }
    }

    setIsProcessing(true);

    try {
      const items = cart.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      }));

      const payload = {
        items,
        buyer_name: formData.name,
        buyer_phone: formData.phone,
        shipping_address: `${formData.address}, ${formData.city}`,
        payment_method: selectedPayment,
      };

      const res = await fetch(`${getBaseUrl()}/api/orders/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json(); // 👈 Parse response

      if (res.ok) {
        clearCart();
        setOrderReference(data.order_reference); // 👈 Save the reference code
        setShowSuccess(true);
      } else {
        alert(`Checkout Failed: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.error(error);
      alert("Network Error");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(orderReference);
    alert("Copied to clipboard!");
  };

  if (cart.length === 0 && !showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/40 backdrop-blur-2xl p-10 rounded-3xl border border-white/40 text-center text-slate-900 font-bold shadow-xl">
           <ShoppingBag size={48} className="mx-auto mb-4 text-slate-400 opacity-50"/>
           <p className="text-xl">Your cart is empty.</p>
           <button 
             onClick={() => router.back()} 
             className="mt-6 btn-primary bg-indigo-600/90 backdrop-blur-md hover:bg-indigo-700"
           >
             Go Shopping
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-12 px-4 relative">
      
      {/* ✨ SUCCESS GLASS POP-UP MODAL ✨ */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" />

          <div className="relative bg-white/90 backdrop-blur-3xl p-8 sm:p-12 rounded-[2.5rem] shadow-2xl border border-white/60 max-w-md w-full text-center animate-[blob_0.4s_ease-out]">
            <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-200 animate-bounce">
              <CheckCircle size={48} strokeWidth={3} />
            </div>
            
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2 drop-shadow-sm">Order Confirmed!</h2>
            <p className="text-slate-500 mb-6 text-sm font-medium leading-relaxed">
              Your order has been successfully placed.
            </p>

            {/* 👇 Reference Code Display */}
            <div className="bg-slate-100 p-4 rounded-xl mb-8 flex items-center justify-between border border-slate-200">
              <div className="text-left">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Order Reference</p>
                <p className="text-xl font-mono font-bold text-indigo-600">{orderReference}</p>
              </div>
              <button onClick={copyToClipboard} className="p-2 hover:bg-white rounded-lg transition text-slate-400 hover:text-indigo-600">
                <Copy size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <Link 
                href={`/track-order?ref=${orderReference}`} 
                className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-lg bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all"
              >
                <Truck size={20} /> Track Order Status
              </Link>
              
              <Link 
                href={`/store/${urlParams.slug}`} 
                className="block text-sm text-slate-400 hover:text-indigo-600 font-bold transition py-2"
              >
                Continue Shopping
              </Link>
            </div>

            <button 
              onClick={() => { setShowSuccess(false); router.push(`/store/${urlParams.slug}`); }}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Main Checkout Content (Blurred when success modal is open) */}
      <div className={`max-w-4xl mx-auto transition-all duration-500 ${showSuccess ? 'blur-md scale-95 opacity-50 pointer-events-none' : ''}`}>
        <button onClick={() => router.back()} className="flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition font-medium bg-white/30 px-4 py-2 rounded-full backdrop-blur-md border border-white/20">
          <ArrowLeft size={18} className="mr-2" /> Back to Cart
        </button>

        <h1 className="text-3xl font-extrabold text-slate-900 mb-8 flex items-center gap-3">
          <CheckCircle className="text-green-500" /> Checkout
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Shipping Form */}
          <div className="md:col-span-2 space-y-6">
            
            <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] shadow-sm border border-white/50">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <MapPin size={24} className="text-indigo-600"/> Shipping Information
              </h2>
              <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Full Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input 
                      required
                      type="text" 
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-white/40 bg-white/50 text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none backdrop-blur-sm transition-all placeholder:text-slate-400 font-medium"
                      placeholder="Abebe Bikila"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Phone Number</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                      <input 
                        required
                        type="tel" 
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-white/40 bg-white/50 text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none backdrop-blur-sm transition-all placeholder:text-slate-400 font-medium"
                        placeholder="0911..."
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">City</label>
                    <select 
                      className="w-full px-4 py-3.5 rounded-xl border border-white/40 bg-white/50 text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none backdrop-blur-sm appearance-none font-medium"
                      value={formData.city}
                      onChange={e => setFormData({...formData, city: e.target.value})}
                    >
                      <option className="text-slate-900 bg-white">Addis Ababa</option>
                      <option className="text-slate-900 bg-white">Adama</option>
                      <option className="text-slate-900 bg-white">Hawassa</option>
                      <option className="text-slate-900 bg-white">Bahir Dar</option>
                      <option className="text-slate-900 bg-white">Mekelle</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Delivery Address</label>
                  <textarea 
                    required
                    rows={3}
                    className="w-full px-4 py-3.5 rounded-xl border border-white/40 bg-white/50 text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none resize-none backdrop-blur-sm placeholder:text-slate-400 font-medium"
                    placeholder="Sub-city, Woreda, House No. or nearby landmark..."
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </form>
            </div>

            <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] shadow-sm border border-white/50">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <CreditCard size={24} className="text-indigo-600"/> Payment Options
              </h2>
              <div className="space-y-4">
                <label className="flex items-center gap-4 p-5 border border-indigo-500/30 bg-indigo-50/60 rounded-2xl cursor-pointer backdrop-blur-sm shadow-sm transition-all hover:bg-indigo-100/50">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={selectedPayment === "cod"}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                    className="w-5 h-5 text-indigo-600 accent-indigo-600"
                  />
                  <span className="font-bold text-slate-900 text-lg">Cash on Delivery</span>
                  <Truck size={20} className="ml-auto text-indigo-600"/>
                </label>

                {/* Dynamic seller-provided methods */}
                {storeInfo?.payment_methods?.length ? (
                  <div className="space-y-3">
                    {storeInfo.payment_methods.map((m: string) => (
                      <div key={m} className="flex items-center gap-4 p-4 border border-white/30 rounded-2xl bg-white/40 backdrop-blur-sm">
                        <input
                          type="radio"
                          name="payment"
                          value={m}
                          checked={selectedPayment === m}
                          onChange={(e) => setSelectedPayment(e.target.value)}
                          className="w-5 h-5"
                        />
                        <div className="flex-1">
                          <span className="font-bold text-slate-900 capitalize">{m}</span>
                          <p className="text-sm text-slate-600 mt-1">{storeInfo.payment_accounts?.[m] || 'Details not provided'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No digital payment options set by this store.</p>
                )}
              </div>
            </div>

          </div>

          <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] shadow-lg shadow-indigo-500/5 border border-white/50 sticky top-32">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <span className="bg-white/50 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-white/40 backdrop-blur-sm">{item.quantity}x</span>
                    <span className="text-slate-700 truncate max-w-[120px] font-semibold">{item.product.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">
                    {(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200/50 pt-5 space-y-3 mb-8">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Subtotal</span>
                <span>{total.toFixed(2)} ETB</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Delivery Fee</span>
                <span>50.00 ETB</span>
              </div>
              <div className="flex justify-between items-center text-xl font-extrabold text-slate-900 pt-3 border-t border-dashed border-slate-300/50">
                <span>Total</span>
                <span className="text-indigo-600">{(total + 50).toFixed(2)} <span className="text-sm font-semibold">ETB</span></span>
              </div>
            </div>

            <button 
              type="submit"
              form="checkout-form"
              disabled={isProcessing}
              className="btn-primary w-full py-4 text-lg shadow-xl shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 transition-all transform hover:-translate-y-1 font-bold rounded-xl"
            >
              {isProcessing ? "Processing..." : "Place Order"}
            </button>
            
            <p className="text-xs text-center text-slate-400 mt-5 font-medium">
              By placing this order, you agree to our Terms of Service.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
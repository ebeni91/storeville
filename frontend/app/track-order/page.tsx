"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getOrderStatus } from "../../lib/api";
import Link from "next/link";
import { Search, Package, ArrowRight, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get("ref") || "";
  
  const [ref, setRef] = useState(initialRef);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ref.trim()) return;

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const data = await getOrderStatus(ref);
      setOrder(data);
    } catch (err: any) {
      setError("Order not found. Please check your reference code.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if ref is present in URL
  if (initialRef && !order && !loading && !error) {
     // Trigger search immediately if coming from link
     // (Using useEffect would be cleaner, but simple logic works for this example)
     // To avoid infinite loops, we just pre-fill the input for now.
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 flex flex-col items-center">
      
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30 text-indigo-600 shadow-lg">
          <Truck size={32} />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2 drop-shadow-sm">Track Your Order</h1>
        <p className="text-slate-500 font-medium">Enter your reference code to see real-time updates.</p>
      </div>

      {/* Search Box */}
      <div className="w-full max-w-lg mb-12 relative z-10">
        <form onSubmit={handleTrack} className="relative group">
          <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-center bg-white/60 backdrop-blur-2xl border border-white/50 rounded-2xl shadow-xl overflow-hidden p-2 pl-4">
            <Search className="text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="e.g. SV-X9A2B3" 
              className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-slate-900 font-mono font-bold placeholder:font-sans placeholder:text-slate-400 placeholder:font-normal"
              value={ref}
              onChange={(e) => setRef(e.target.value.toUpperCase())}
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Searching..." : "Track"}
            </button>
          </div>
        </form>
      </div>

      {/* Results Area */}
      <div className="w-full max-w-2xl transition-all duration-500">
        
        {error && (
          <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 p-6 rounded-2xl flex items-center gap-4 text-red-600 animate-[shake_0.5s_ease-in-out]">
            <AlertCircle size={24} />
            <span className="font-bold">{error}</span>
          </div>
        )}

        {order && (
          <div className="bg-white/40 backdrop-blur-3xl border border-white/50 p-8 rounded-[2rem] shadow-2xl animate-[blob_0.5s_ease-out]">
            
            {/* Status Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-white/30 pb-6 gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Order Status</p>
                <div className="flex items-center gap-2">
                  {order.status === 'completed' && <CheckCircle className="text-green-500" size={24} />}
                  {order.status === 'pending' && <Clock className="text-orange-500" size={24} />}
                  {order.status === 'shipped' && <Truck className="text-blue-500" size={24} />}
                  <span className="text-2xl font-extrabold text-slate-900 capitalize">{order.status}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Total Amount</p>
                <p className="text-xl font-extrabold text-indigo-600">{order.total} ETB</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-white/30 p-4 rounded-xl border border-white/20">
                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Order Date</p>
                <p className="font-medium text-slate-900">{order.date}</p>
              </div>
              <div className="bg-white/30 p-4 rounded-xl border border-white/20">
                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Buyer</p>
                <p className="font-medium text-slate-900">{order.buyer}</p>
              </div>
              <div className="bg-white/30 p-4 rounded-xl border border-white/20">
                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Items</p>
                <p className="font-medium text-slate-900">{order.items_count} Product(s)</p>
              </div>
              <div className="bg-white/30 p-4 rounded-xl border border-white/20">
                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Reference</p>
                <p className="font-mono font-bold text-slate-900">{order.reference}</p>
              </div>
            </div>

            <Link href="/" className="btn-secondary w-full py-4 text-center block bg-white/50 hover:bg-white/70 backdrop-blur-md">
              <ArrowRight size={18} className="inline mr-2" /> Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-32 text-center text-slate-500">Loading Tracker...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
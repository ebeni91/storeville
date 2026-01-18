"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBaseUrl } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Store, ArrowRight, Palette, Rocket, MapPin } from "lucide-react";
import dynamic from "next/dynamic";

// 📍 Dynamically import the picker (Client-side only)
const LocationPicker = dynamic(() => import("../../components/LocationPicker"), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-slate-100 rounded-2xl animate-pulse flex items-center justify-center text-slate-400">Loading Map...</div>
});

export default function CreateStorePage() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("electronics");
  const [color, setColor] = useState("#3b82f6");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  const { token } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

    // Prepare payload with location
    const payload = {
      name,
      slug,
      category,
      primary_color: color,
      address,
      latitude: location?.lat,
      longitude: location?.lng
    };

    const res = await fetch(`${getBaseUrl()}/api/stores/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      alert("Failed to create store. Name might be taken.");
      setIsLoading(false);
    }
  };

  const colors = [
    { bg: '#3b82f6', name: 'Ocean Blue' },
    { bg: '#ef4444', name: 'Ruby Red' },
    { bg: '#10b981', name: 'Emerald' },
    { bg: '#f59e0b', name: 'Amber' },
    { bg: '#8b5cf6', name: 'Violet' },
    { bg: '#0f172a', name: 'Midnight' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-24 pb-12">
      <div className="bg-white/10 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl shadow-xl w-full max-w-lg border border-white/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-50/50 backdrop-blur-sm text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100/30">
            <Rocket size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Launch Your Store</h1>
          <p className="text-slate-500 mt-2">Let's get your digital storefront ready.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Store Name</label>
            <div className="relative">
              <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/20 bg-white/10 text-slate-900 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 backdrop-blur-sm"
                placeholder="e.g. Jimma Electronics"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-slate-900 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all appearance-none backdrop-blur-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="electronics" className="text-slate-900 bg-white">Electronics</option>
              <option value="fashion" className="text-slate-900 bg-white">Fashion</option>
              <option value="home" className="text-slate-900 bg-white">Home & Garden</option>
              <option value="art" className="text-slate-900 bg-white">Art & Crafts</option>
              <option value="food" className="text-slate-900 bg-white">Food</option>
            </select>
          </div>

          {/* 📍 Location Picker */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Pin Store Location</label>
            <LocationPicker onLocationChange={(lat, lng) => setLocation({lat, lng})} />
            
            <div className="relative mt-3">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/20 bg-white/10 text-slate-900 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 backdrop-blur-sm"
                placeholder="Address Details (e.g. Merkato, Next to Bank)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Palette size={16} /> Brand Color
            </label>
            <div className="flex gap-3 justify-center bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
              {colors.map((c) => (
                <button
                  key={c.bg}
                  type="button"
                  className={`w-10 h-10 rounded-full transition-all duration-200 border-2 border-white/50 shadow-sm ${color === c.bg ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110 shadow-lg' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c.bg }}
                  onClick={() => setColor(c.bg)}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="btn-primary w-full py-4 text-lg mt-4 bg-indigo-600/90 hover:bg-indigo-700/90 backdrop-blur-md shadow-indigo-500/20"
          >
            {isLoading ? "Launching..." : "Create Store"}
            {!isLoading && <ArrowRight size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
}
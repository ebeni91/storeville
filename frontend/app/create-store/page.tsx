"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBaseUrl } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Store, ArrowRight, Palette, Rocket } from "lucide-react";

export default function CreateStorePage() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("electronics");
  const [color, setColor] = useState("#3b82f6");
  const { token } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

    const res = await fetch(`${getBaseUrl()}/api/stores/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${token}`,
      },
      body: JSON.stringify({ name, slug, category, primary_color: color }),
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl w-full max-w-lg border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
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
                className="input-field pl-10"
                placeholder="e.g. Addis Fashion"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
            <select 
              className="input-field appearance-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion</option>
              <option value="home">Home & Garden</option>
              <option value="art">Art & Crafts</option>
              <option value="food">Food</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Palette size={16} /> Brand Color
            </label>
            <div className="flex gap-3 justify-center">
              {colors.map((c) => (
                <button
                  key={c.bg}
                  type="button"
                  className={`w-10 h-10 rounded-full transition-all duration-200 ${color === c.bg ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110 shadow-lg' : 'hover:scale-105'}`}
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
            className="btn-primary w-full py-4 text-lg mt-4"
          >
            {isLoading ? "Launching..." : "Create Store"}
            {!isLoading && <ArrowRight size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
}
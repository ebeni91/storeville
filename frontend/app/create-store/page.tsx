"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBaseUrl } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function CreateStorePage() {
  const [name, setName] = useState("");
  // 👇 FIX 1: Default to lowercase key
  const [category, setCategory] = useState("electronics"); 
  const [color, setColor] = useState("#3b82f6");
  const { token } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-generate slug (simple version)
    const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

    const res = await fetch(`${getBaseUrl()}/api/stores/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${token}`, // <--- Send Auth Token
      },
      body: JSON.stringify({
        name,
        slug,
        category,
        primary_color: color
      }),
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      alert("Failed to create store. Name might be taken.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6">Open Your Store</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-bold text-gray-700">Store Name</label>
            <input 
              type="text" 
              className="w-full border p-3 rounded mt-1"
              placeholder="e.g. Addis Fashion"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700">Category</label>
            <select 
              className="w-full border p-3 rounded mt-1 bg-white"
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
            <label className="block text-sm font-bold text-gray-700">Brand Color</label>
            <div className="flex gap-4 mt-2">
              {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#111827'].map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-black scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700"
          >
            Launch Store 🚀
          </button>
        </form>
      </div>
    </div>
  );
}
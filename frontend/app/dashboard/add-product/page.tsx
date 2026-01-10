"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBaseUrl } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import { ArrowLeft, Upload, Save, DollarSign, Package } from "lucide-react";

export default function AddProductPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { token } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("is_available", "true");
    if (image) formData.append("image", image);

    try {
      const res = await fetch(`${getBaseUrl()}/api/products/`, {
        method: "POST",
        headers: { "Authorization": `Token ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to create product");
      router.push("/dashboard");
    } catch (err) {
      alert("Error adding product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 flex justify-center">
      <div className="w-full max-w-3xl">
        
        <button onClick={() => router.back()} className="text-slate-500 hover:text-indigo-600 font-medium mb-6 flex items-center gap-2 transition">
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
            <h1 className="text-2xl font-bold text-slate-900">Add New Product</h1>
            <p className="text-slate-500">Fill in the details to add items to your inventory.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Basic Information</h3>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Wireless Headphones"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                <textarea 
                  className="input-field h-32 resize-none" 
                  placeholder="Describe your product..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Pricing & Stock */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Sales Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price (ETB)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="number" 
                      className="input-field pl-10" 
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Stock Quantity</label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="number" 
                      className="input-field pl-10" 
                      placeholder="1"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Image */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Media</h3>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition cursor-pointer relative">
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                />
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-3">
                  <Upload size={24} />
                </div>
                <p className="text-sm font-medium text-slate-700">
                  {image ? image.name : "Click to upload image"}
                </p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</p>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
               <button 
                type="button" 
                onClick={() => router.back()}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isLoading}
                className="btn-primary flex-1"
              >
                {isLoading ? "Saving..." : "Save Product"}
                {!isLoading && <Save size={18} />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBaseUrl } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import { ArrowLeft, UploadCloud, Package, DollarSign, FileText, Image as ImageIcon, CheckCircle, Plus } from "lucide-react";

export default function AddProductPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const { token } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("stock", stock);
    if (image) {
      formData.append("image", image);
    }

    try {
      const res = await fetch(`${getBaseUrl()}/api/products/`, {
        method: "POST",
        headers: {
          "Authorization": `Token ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        alert("Failed to add product");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 flex justify-center items-start">
      
      {/* Glass Container */}
      <div className="w-full max-w-2xl bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden animate-[blob_0.5s_ease-out]">
        
        {/* Header */}
        <div className="p-8 border-b border-white/40 flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-white/50 text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <Package className="text-indigo-600" /> Add New Product
            </h1>
            <p className="text-slate-500 text-sm mt-1">Fill in the details to list your item.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          
          {/* Input Fields Grid */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Product Name</label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  required 
                  className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-white/40 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 outline-none backdrop-blur-sm transition-all shadow-sm"
                  placeholder="e.g. Vintage Leather Jacket"
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Price (ETB)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="number" 
                    required 
                    min="0"
                    step="0.01"
                    className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-white/40 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 outline-none backdrop-blur-sm transition-all shadow-sm"
                    placeholder="0.00"
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Stock Quantity</label>
                <div className="relative">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="number" 
                    required 
                    min="0"
                    className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-white/40 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 outline-none backdrop-blur-sm transition-all shadow-sm"
                    placeholder="1"
                    value={stock} 
                    onChange={(e) => setStock(e.target.value)} 
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Description</label>
              <textarea 
                required 
                rows={4}
                className="w-full p-4 bg-white/50 border border-white/40 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 outline-none backdrop-blur-sm transition-all shadow-sm resize-none"
                placeholder="Describe your product features, material, sizing..."
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
              />
            </div>
          </div>

          {/* Image Upload Area */}
          <div className="group relative w-full h-64 rounded-2xl border-2 border-dashed border-indigo-300/50 bg-indigo-50/30 hover:bg-indigo-50/50 hover:border-indigo-500/50 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center text-center">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />
            
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <div className="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center text-indigo-500 mb-4 shadow-sm group-hover:scale-110 transition-transform backdrop-blur-sm">
                  <UploadCloud size={32} />
                </div>
                <p className="text-slate-600 font-medium group-hover:text-indigo-600">Click to upload product image</p>
                <p className="text-slate-400 text-xs mt-1">SVG, PNG, JPG or GIF (MAX. 5MB)</p>
              </>
            )}

            {/* Change Image Overlay (Only shows if image exists) */}
            {previewUrl && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 backdrop-blur-sm">
                 <p className="text-white font-bold flex items-center gap-2"><ImageIcon /> Change Image</p>
              </div>
            )}
          </div>


          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 rounded-xl btn-primary text-lg font-bold shadow-xl shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              "Publishing Product..."
            ) : (
              <>
                <Plus size={22} strokeWidth={3} /> Publish Product
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
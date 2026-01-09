"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBaseUrl } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";

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

    // 1. Prepare FormData (Required for Image Uploads)
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("is_available", "true");
    if (image) {
      formData.append("image", image);
    }

    try {
      const res = await fetch(`${getBaseUrl()}/api/products/`, {
        method: "POST",
        headers: {
          // Note: Do NOT set Content-Type here. Browser sets it for FormData automatically.
          "Authorization": `Token ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to create product");
      }

      // Success!
      router.push("/dashboard");
    } catch (err) {
      alert("Error adding product");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex justify-center">
      <div className="bg-white p-8 rounded-lg shadow-sm w-full max-w-2xl h-fit">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Add New Product</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700">Product Name</label>
            <input 
              type="text" 
              className="w-full border p-2 rounded mt-1" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700">Description</label>
            <textarea 
              className="w-full border p-2 rounded mt-1 h-24" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Price & Stock Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700">Price (ETB)</label>
              <input 
                type="number" 
                className="w-full border p-2 rounded mt-1" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">Stock Qty</label>
              <input 
                type="number" 
                className="w-full border p-2 rounded mt-1" 
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-bold text-gray-700">Product Image</label>
            <input 
              type="file" 
              className="w-full border p-2 rounded mt-1 bg-gray-50" 
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={() => router.back()}
              className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
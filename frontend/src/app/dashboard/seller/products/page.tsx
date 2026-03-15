'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Image as ImageIcon, X, Loader2, Edit, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'

// Define the Product type based on our Django model
interface Product {
  id: number;
  name: string;
  price: string;
  stock: number;
  is_active: boolean;
  image: string | null;
}

export default function ProductsPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [isFetching, setIsFetching] = useState(true)

  // Form State
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)

  // Fetch real products from Django on load
  const fetchProducts = async () => {
    try {
      const res = await api.get('/stores/products/')
      setProducts(res.data)
    } catch (err) {
      console.error("Failed to fetch products", err)
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Use FormData to support Image uploads alongside text data
      const formData = new FormData()
      formData.append('name', name)
      formData.append('description', description)
      formData.append('price', price)
      formData.append('stock', stock)
      if (imageFile) {
        formData.append('image', imageFile)
      }

      await api.post('/stores/products/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      setIsDrawerOpen(false)
      
      // Reset form
      setName('')
      setDescription('')
      setPrice('')
      setStock('')
      setImageFile(null)
      
      // Refresh the table with the new product
      fetchProducts()
      
    } catch (err: any) {
      alert("Error saving product: " + (err.response?.data?.detail || JSON.stringify(err.response?.data) || "Check console"))
      console.error("Product Creation Error:", err.response?.data)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="p-8 relative h-full">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">My Products</h1>
          <p className="text-gray-500 font-medium mt-1">Manage your store's inventory and pricing.</p>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
        >
          <Plus size={20} /> Add New Product
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider font-bold">
              <th className="p-4">Product</th>
              <th className="p-4">Price (Br)</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isFetching ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  <Loader2 className="animate-spin mx-auto mb-2" size={32} /> 
                  Loading inventory...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">
                  No products yet. Click "Add New Product" to start!
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 overflow-hidden border border-gray-200">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={20} />
                      )}
                    </div>
                    <span className="font-bold text-gray-900">{product.name}</span>
                  </td>
                  <td className="p-4 font-bold text-gray-700">Br {product.price}</td>
                  <td className="p-4 font-medium text-gray-600">{product.stock} units</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      product.stock > 0 && product.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {product.stock > 0 && product.is_active ? 'Active' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Edit size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* THE SLIDE-OUT DRAWER OVERLAY */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Dark background overlay */}
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          ></div>
          
          {/* Drawer Panel */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-black text-gray-900">Add New Product</h2>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form id="product-form" onSubmit={handleCreateProduct} className="space-y-6">
                
                {/* Image Upload Input */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Product Image</label>
                  <label className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-indigo-300 transition-colors cursor-pointer group relative overflow-hidden">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    />
                    {imageFile ? (
                      <div className="text-center font-bold text-indigo-600">{imageFile.name}</div>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <ImageIcon size={24} />
                        </div>
                        <span className="font-bold text-sm">Click to upload image</span>
                        <span className="text-xs mt-1">PNG, JPG up to 5MB</span>
                      </>
                    )}
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
                  <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Samsung Galaxy S24" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Price (ETB)</label>
                    <input required type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Stock Quantity</label>
                    <input required type="number" value={stock} onChange={e => setStock(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="10" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                  <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px]" placeholder="Describe your product..." />
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50">
              <button 
                type="submit" 
                form="product-form"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? <Loader2 size={24} className="animate-spin" /> : 'Save Product'}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}
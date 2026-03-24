'use client'

import React, { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Plus, Package, Edit, Trash2, Flame, Leaf, Clock, Loader2 } from 'lucide-react'

export default function SmartProductsPage() {
  const [store, setStore] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Form States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const storeRes = await api.get('/stores/manage/')
        const currentStore = storeRes.data[0]
        setStore(currentStore)

        if (currentStore.store_type === 'FOOD') {
          const [menuRes, catRes] = await Promise.all([api.get('/food/items/'), api.get('/food/categories/')])
          setItems(menuRes.data.results || menuRes.data)
          setCategories(catRes.data.results || catRes.data)
        } else {
          const [prodRes, catRes] = await Promise.all([api.get('/retail/products/'), api.get('/retail/categories/')])
          setItems(prodRes.data.results || prodRes.data)
          setCategories(catRes.data.results || catRes.data)
        }
      } catch (err) {
        console.error("Dashboard Error", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const endpoint = store.store_type === 'FOOD' ? '/food/items/' : '/retail/products/'
      await api.post(endpoint, formData)
      window.location.reload() // Quick reload to fetch new data
    } catch (err) {
      alert("Failed to save item. Ensure all required fields are filled.")
    }
  }

  if (isLoading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>

  const isFood = store?.store_type === 'FOOD'

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">{isFood ? 'Menu Manager' : 'Inventory Manager'}</h1>
          <p className="text-gray-500 font-medium mt-1">{isFood ? 'Manage your dishes, prep times, and dietary tags.' : 'Manage your products, SKUs, and stock levels.'}</p>
        </div>
        <button onClick={() => { setFormData({}); setIsModalOpen(true); }} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-colors">
          <Plus size={18} /> {isFood ? 'Add Dish' : 'Add Product'}
        </button>
      </div>

      {/* ITEMS TABLE */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Item Name</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Price</th>
              {isFood ? (
                <>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Prep Time</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Tags</th>
                </>
              ) : (
                <>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">SKU</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Stock</th>
                </>
              )}
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden border">
                    {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <Package className="m-auto mt-2 opacity-30" size={20}/>}
                  </div>
                  {item.name}
                </td>
                <td className="p-4 font-bold text-gray-600">Br {item.price}</td>
                
                {isFood ? (
                  <>
                    <td className="p-4 text-sm font-medium text-gray-600"><span className="bg-gray-100 px-2 py-1 rounded-md text-xs font-bold">{item.preparation_time_minutes} min</span></td>
                    <td className="p-4 flex gap-1">
                      {item.is_vegan && <Leaf size={16} className="text-green-500" />}
                      {item.is_spicy && <Flame size={16} className="text-red-500" />}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-4 text-sm text-gray-500 font-mono">{item.sku || 'N/A'}</td>
                    <td className="p-4 text-sm font-bold text-gray-900">
                      <span className={`px-2 py-1 rounded-md ${item.stock_quantity > 5 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {item.stock_quantity}
                      </span>
                    </td>
                  </>
                )}
                
                <td className="p-4">
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full">
                    {item.is_active || item.is_available ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="p-4 flex justify-end gap-2">
                  <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"><Edit size={18} /></button>
                  <button className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <div className="p-10 text-center text-gray-500 font-medium">No items found. Create one above!</div>}
      </div>

      {/* CREATE MODAL (Adapts based on store type) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-black mb-6">{isFood ? 'New Menu Item' : 'New Product'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Name</label>
                  <input required type="text" onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-xl p-3 mt-1 outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Price (Br)</label>
                  <input required type="number" step="0.01" onChange={e => setFormData({...formData, price: e.target.value})} className="w-full border rounded-xl p-3 mt-1 outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                  <select required onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border rounded-xl p-3 mt-1 outline-none focus:border-indigo-500 bg-white">
                    <option value="">Select...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {/* DYNAMIC FIELDS based on Store Type */}
              {isFood ? (
                <div className="grid grid-cols-2 gap-4 bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-orange-800 uppercase flex items-center gap-1"><Clock size={14}/> Prep Time (Mins)</label>
                    <input type="number" defaultValue={15} onChange={e => setFormData({...formData, preparation_time_minutes: e.target.value})} className="w-full border border-orange-200 rounded-xl p-3 mt-1 outline-none" />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded-lg border">
                    <input type="checkbox" onChange={e => setFormData({...formData, is_vegan: e.target.checked})} /> <span className="text-sm font-bold text-green-700 flex items-center gap-1"><Leaf size={14}/> Vegan</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded-lg border">
                    <input type="checkbox" onChange={e => setFormData({...formData, is_spicy: e.target.checked})} /> <span className="text-sm font-bold text-red-700 flex items-center gap-1"><Flame size={14}/> Spicy</span>
                  </label>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                  <div>
                    <label className="text-xs font-bold text-indigo-800 uppercase">SKU</label>
                    <input type="text" onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full border border-indigo-200 rounded-xl p-3 mt-1 outline-none" placeholder="e.g. TSHIRT-01" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-indigo-800 uppercase">Stock Limit</label>
                    <input type="number" defaultValue={10} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} className="w-full border border-indigo-200 rounded-xl p-3 mt-1 outline-none" />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
'use client'

import React, { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Plus, Package, Edit, Trash2, Flame, Leaf, Clock, Loader2, UploadCloud, Image as ImageIcon, EyeOff } from 'lucide-react'

export default function SmartProductsPage() {
  const [store, setStore] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Form States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [formData, setFormData] = useState<any>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const storeRes = await api.get('/stores/manage/')
        const storeList = storeRes.data?.results || storeRes.data || []
        const currentStore = storeList[0]
        
        if (!currentStore) {
            console.error("No store found for user")
            setIsLoading(false)
            return
        }

        setStore(currentStore)

        if (currentStore.store_type === 'FOOD') {
          const [menuRes, catRes] = await Promise.all([
            api.get(`/food/items/?_t=${Date.now()}`), 
            api.get(`/food/categories/?limit=1000&_t=${Date.now()}`)
          ])
          setItems(menuRes.data?.results || menuRes.data || [])
          setCategories(catRes.data?.results || catRes.data || [])
        } else {
          const [prodRes, catRes] = await Promise.all([
            api.get(`/retail/products/?_t=${Date.now()}`), 
            api.get(`/retail/categories/?limit=1000&_t=${Date.now()}`)
          ])
          setItems(prodRes.data?.results || prodRes.data || [])
          setCategories(catRes.data?.results || catRes.data || [])
        }
      } catch (err) {
        console.error("Dashboard Error", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  const handleOpenCreate = () => {
    setEditingItemId(null)
    setFormData({ is_active: true, is_available: true, stock_quantity: 10, preparation_time_minutes: 15 })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item: any) => {
    setEditingItemId(item.id)
    setFormData({
      ...item,
      // Default to what the backend returned
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const isFood = store.store_type === 'FOOD'
      const baseEndpoint = isFood ? '/food/items/' : '/retail/products/'
      const submitEndpoint = editingItemId ? `${baseEndpoint}${editingItemId}/` : baseEndpoint
      
      const submitData = new FormData()
      Object.keys(formData).forEach(key => {
        // Skip purely readonly / generic fields from the API we shouldn't send back
        if (key === 'category_name' || key === 'id' || key === 'created_at' || key === 'updated_at') return;
        
        // If image is still a String URL, don't append it! Django ImageField expects File objects only on upload
        if (key === 'image' && typeof formData[key] === 'string') return;

        if (formData[key] !== undefined && formData[key] !== null) {
          // Serialize booleans to string for Multipart Form Data
          if (typeof formData[key] === 'boolean') {
            submitData.append(key, formData[key] ? 'true' : 'false')
          } else {
            submitData.append(key, formData[key])
          }
        }
      })

      if (editingItemId) {
        await api.patch(submitEndpoint, submitData, { headers: { 'Content-Type': 'multipart/form-data' } })
      } else {
        await api.post(submitEndpoint, submitData, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      
      window.location.reload() 
    } catch (err: any) {
      console.error(err.response?.data)
      alert("Failed to save item. Ensure all required fields are filled.")
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      const endpoint = store.store_type === 'FOOD' ? `/food/items/${id}/` : `/retail/products/${id}/`
      await api.delete(endpoint)
      window.location.reload()
    } catch (err) {
      alert("Failed to delete item.")
    }
  }
  
  const toggleVisibility = async (item: any) => {
    try {
      const isFood = store.store_type === 'FOOD'
      const endpoint = isFood ? `/food/items/${item.id}/` : `/retail/products/${item.id}/`
      const field = isFood ? 'is_available' : 'is_active'
      const newValue = !item[field]
      
      await api.patch(endpoint, { [field]: newValue })
      
      setItems(items.map(i => i.id === item.id ? { ...i, [field]: newValue } : i))
    } catch (err) {
      alert("Failed to update status.")
    }
  }

  if (isLoading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>

  const isFood = store?.store_type === 'FOOD'

  return (
    <div className="p-8 pb-32">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">{isFood ? 'Menu Manager' : 'Inventory Manager'}</h1>
          <p className="text-gray-500 font-medium mt-1">{isFood ? 'Manage your dishes, prep times, and dietary tags.' : 'Manage your products, SKUs, and stock levels.'}</p>
        </div>
        <button onClick={handleOpenCreate} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-colors shadow-lg hover:scale-105 active:scale-95 duration-200">
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
            {items.map((item) => {
              const isActive = isFood ? item.is_available : item.is_active;
              
              return (
              <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${!isActive ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                <td className="p-4 font-bold text-gray-900 flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden border flex items-center justify-center shrink-0">
                    {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-300" size={20}/>}
                  </div>
                  <div className="flex flex-col">
                     <span className="flex items-center gap-2">
                        {item.name} 
                        {!isActive && <EyeOff size={14} className="text-gray-400" />}
                     </span>
                     {item.category_name && <span className="text-xs text-indigo-600 font-bold uppercase tracking-widest">{item.category_name}</span>}
                  </div>
                </td>
                <td className="p-4 font-black text-gray-600">Br {item.price}</td>
                
                {isFood ? (
                  <>
                    <td className="p-4 text-sm font-medium text-gray-600"><span className="bg-orange-50 text-orange-700 px-2 py-1 rounded-md text-xs font-bold flex items-center w-max gap-1"><Clock size={12}/> {item.preparation_time_minutes} min</span></td>
                    <td className="p-4 flex gap-1 items-center h-full pt-6">
                      {item.is_vegan && <div className="p-1 bg-green-100 rounded text-green-600" title="Vegan"><Leaf size={14} /></div>}
                      {item.is_spicy && <div className="p-1 bg-red-100 rounded text-red-600" title="Spicy"><Flame size={14} /></div>}
                      {!item.is_vegan && !item.is_spicy && <span className="text-xs text-gray-400 font-medium">-</span>}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-4 text-sm text-gray-500 font-mono font-bold bg-gray-50 px-2 rounded">{item.sku || 'N/A'}</td>
                    <td className="p-4 text-sm font-bold text-gray-900">
                      <span className={`px-3 py-1.5 rounded-lg border ${item.stock_quantity > 5 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {item.stock_quantity}
                      </span>
                    </td>
                  </>
                )}
                
                <td className="p-4">
                  <button onClick={() => toggleVisibility(item)} className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'}`}>
                    {isActive ? 'Active' : 'Hidden'}
                  </button>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleOpenEdit(item)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-indigo-600 transition-colors"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="p-16 text-center border-t border-gray-100">
            <Package size={48} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-xl font-black tracking-tight text-gray-900 mb-2">No Items Found</h3>
            <p className="text-gray-500 font-medium max-w-sm mx-auto">You haven't added any products or menu items yet. Click the button above to get started.</p>
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
            <h2 className="text-3xl font-black mb-8 tracking-tight text-gray-900">
              {editingItemId ? (isFood ? 'Edit Dish' : 'Edit Product') : (isFood ? 'New Menu Item' : 'New Product')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block">Item Name</label>
                  <input required type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" placeholder="e.g. Classic Burger" />
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block">Description</label>
                  <textarea value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none min-h-[100px]" placeholder="Brief description of the item..."></textarea>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block">Price (Br)</label>
                  <input required type="number" step="0.01" value={formData.price || ''} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none font-black text-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-indigo-700" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block">Category</label>
                  <select required value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer">
                    <option value="">Select Category...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {/* STATUS TOGGLE */}
                <div className="md:col-span-2 flex items-center justify-between bg-gray-50 border border-gray-200 rounded-2xl p-6 mt-2">
                  <div>
                    <h4 className="font-black text-gray-900 drop-shadow-sm tracking-tight">{isFood ? 'Available on Menu' : 'Active Listing'}</h4>
                    <p className="text-xs text-gray-500 font-medium mt-1">If hidden, customers will not see or be able to order this item.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={isFood ? (formData.is_available !== false) : (formData.is_active !== false)}
                      onChange={e => setFormData({
                        ...formData, 
                        ...(isFood ? { is_available: e.target.checked } : { is_active: e.target.checked })
                      })} 
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600 shadow-inner"></div>
                  </label>
                </div>

                {/* IMAGE UPLOAD */}
                <div className="md:col-span-2 mb-4">
                  <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block">Featured Image</label>
                  <label className="group relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50 hover:border-indigo-400 transition-all overflow-hidden bg-gray-50/50">
                    {formData.image ? (
                        <div className="absolute inset-0 w-full h-full bg-gray-100">
                           <img src={typeof formData.image === 'string' ? formData.image : URL.createObjectURL(formData.image)} className="w-full h-full object-contain opacity-80 group-hover:opacity-50 transition-opacity" />
                           <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="bg-black/80 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-xl">Change Image</span>
                           </div>
                        </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400 group-hover:text-indigo-500 transition-colors">
                        <UploadCloud className="w-10 h-10 mb-3" />
                        <p className="text-sm font-bold">Click to upload image</p>
                        <p className="text-xs font-medium opacity-70 mt-1">JPEG, PNG, WEBP (Max 5MB)</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={e => setFormData({...formData, image: e.target.files?.[0]})} />
                  </label>
                </div>
              </div>

              {/* DYNAMIC FIELDS based on Store Type */}
              {isFood ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 bg-orange-50/50 p-6 rounded-2xl border border-orange-100">
                  <div className="col-span-2 lg:col-span-3">
                    <h4 className="text-sm font-black text-orange-900 tracking-tight flex items-center gap-2 mb-4"><Flame className="text-orange-500" size={18}/> Kitchen Details</h4>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-orange-900/60 tracking-widest uppercase mb-2 block flex items-center gap-1">Prep Time (Mins)</label>
                    <input type="number" value={formData.preparation_time_minutes || ''} onChange={e => setFormData({...formData, preparation_time_minutes: e.target.value})} className="w-full bg-white border border-orange-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-orange-500 font-bold text-orange-900" />
                  </div>
                  <label className="flex items-center justify-center gap-3 cursor-pointer p-4 bg-white rounded-xl border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                    <input type="checkbox" checked={formData.is_vegan || false} onChange={e => setFormData({...formData, is_vegan: e.target.checked})} className="w-5 h-5 accent-green-600" /> 
                    <span className="text-sm font-bold text-green-700 flex items-center gap-1.5"><Leaf size={16}/> Vegan</span>
                  </label>
                  <label className="flex items-center justify-center gap-3 cursor-pointer p-4 bg-white rounded-xl border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                    <input type="checkbox" checked={formData.is_spicy || false} onChange={e => setFormData({...formData, is_spicy: e.target.checked})} className="w-5 h-5 accent-red-600" /> 
                    <span className="text-sm font-bold text-red-700 flex items-center gap-1.5"><Flame size={16}/> Spicy</span>
                  </label>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                  <div className="col-span-2">
                    <h4 className="text-sm font-black text-indigo-900 tracking-tight flex items-center gap-2 mb-4"><Package className="text-indigo-500" size={18}/> Inventory Details</h4>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-indigo-900/60 tracking-widest uppercase mb-2 block">SKU</label>
                    <input type="text" value={formData.sku || ''} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full bg-white border border-indigo-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-900" placeholder="e.g. TSHIRT-01" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-indigo-900/60 tracking-widest uppercase mb-2 block">Stock Limit</label>
                    <input type="number" value={formData.stock_quantity || ''} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} className="w-full bg-white border border-indigo-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-900" />
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-6 border-t border-gray-100 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-black tracking-widest uppercase text-xs hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 bg-indigo-600 text-white rounded-xl font-black tracking-widest uppercase text-xs shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:scale-[1.02] transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:hover:scale-100">
                  {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : (editingItemId ? 'Update Item' : 'Save Item')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
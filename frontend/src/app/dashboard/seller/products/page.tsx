'use client'

import React, { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Plus, Package, Edit, Trash2, Flame, Leaf, Clock, Loader2, UploadCloud, Image as ImageIcon, EyeOff } from 'lucide-react'
import { motion, Variants } from 'framer-motion'

export default function SmartProductsPage() {
  const [store, setStore] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Form States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [formData, setFormData] = useState<any>({})
  const [categoryName, setCategoryName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Advanced Options & Extras
  const [pendingOptions, setPendingOptions] = useState<any[]>([])
  const [newOptionName, setNewOptionName] = useState('')
  const [newOptionChoices, setNewOptionChoices] = useState('')
  const [newOptionRequired, setNewOptionRequired] = useState(false)

  const [pendingExtras, setPendingExtras] = useState<any[]>([])
  const [newExtraName, setNewExtraName] = useState('')
  const [newExtraPrice, setNewExtraPrice] = useState('')

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
    setPendingOptions([])
    setPendingExtras([])
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item: any) => {
    setEditingItemId(item.id)
    setFormData({
      ...item,
    })
    setPendingOptions(item.options || [])
    setPendingExtras(item.extras || [])
    setIsModalOpen(true)
  }

  const addPendingOption = () => {
    if (!newOptionName.trim() || !newOptionChoices.trim()) return;
    const choicesList = newOptionChoices.split(',').map((s: string) => s.trim()).filter(Boolean);
    if (choicesList.length === 0) return;
    setPendingOptions([...pendingOptions, {
      id: Date.now().toString(),
      name: newOptionName.trim(),
      choices: choicesList,
      required: newOptionRequired
    }]);
    setNewOptionName('');
    setNewOptionChoices('');
    setNewOptionRequired(false);
  }

  const addPendingExtra = () => {
    if (!newExtraName.trim() || !newExtraPrice.trim()) return;
    setPendingExtras([...pendingExtras, {
      id: Date.now().toString(),
      name: newExtraName.trim(),
      price: newExtraPrice.trim()
    }]);
    setNewExtraName('');
    setNewExtraPrice('');
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
        if (key === 'category_name' || key === 'id' || key === 'created_at' || key === 'updated_at' || key === 'store') return;

        // If image is still a String URL, don't append it! Django ImageField expects File objects only on upload
        if (key === 'image' && typeof formData[key] === 'string') return;

        if (formData[key] !== undefined && formData[key] !== null && typeof formData[key] !== 'object') {
          // Serialize booleans to string for Multipart Form Data
          if (typeof formData[key] === 'boolean') {
            submitData.append(key, formData[key] ? 'true' : 'false')
          } else {
            submitData.append(key, formData[key])
          }
        }
      })

      // ALWAYS SEND store_id so backend IDOR checks and assignment works perfectly.
      submitData.append('store_id', store.id)

      // Attach Options and Extras as JSON arrays
      if (pendingOptions.length > 0) submitData.append('options', JSON.stringify(pendingOptions))
      if (pendingExtras.length > 0) submitData.append('extras', JSON.stringify(pendingExtras))

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

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryName.trim()) return;
    setIsSubmitting(true)
    try {
      const endpoint = store.store_type === 'FOOD' ? '/food/categories/' : '/retail/categories/'
      await api.post(endpoint, { name: categoryName.trim(), store_id: store.id })
      setIsCategoryModalOpen(false)
      window.location.reload()
    } catch (err) {
      console.error(err)
      alert("Failed to create category.")
    } finally {
      setIsSubmitting(false)
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

  if (isLoading) return <div className="p-10 flex justify-center w-full min-h-screen items-center"><Loader2 className="animate-spin text-gray-900" size={40} /></div>

  const isFood = store?.store_type === 'FOOD'

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  }

  const rowVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.3 } }
  }

  return (
    <div className="p-4 md:p-8 lg:p-12 pb-32 max-w-[1600px] mx-auto relative z-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-5 md:gap-4 w-full">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter mb-1 md:mb-2">{isFood ? 'Menu Manager' : 'Inventory Manager'}</h1>
          <p className="text-gray-600 font-semibold text-sm md:text-lg">{isFood ? 'Manage your dishes, prep times, and dietary tags.' : 'Manage your products, SKUs, and stock levels.'}</p>
        </div>
        <div className="flex flex-row md:flex-row items-center gap-3 w-full md:w-auto">
          <button onClick={() => setIsCategoryModalOpen(true)} className="flex-1 md:flex-none justify-center bg-white text-gray-900 border border-gray-200 px-4 md:px-6 py-3.5 rounded-2xl md:rounded-full text-xs md:text-sm font-black tracking-widest uppercase hover:bg-gray-50 transition-all shadow-sm">
            Add Category
          </button>
          <button onClick={handleOpenCreate} className="flex-1 md:flex-none justify-center bg-gray-900 text-white px-4 md:px-7 py-3.5 rounded-2xl md:rounded-full text-xs md:text-sm font-black tracking-widest uppercase hover:bg-black hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)] transition-all flex items-center gap-2 transform hover:-translate-y-0.5 shadow-[0_8px_20px_rgba(0,0,0,0.12)] whitespace-nowrap">
            <Plus size={16} className="md:w-[18px] md:h-[18px]" /> {isFood ? 'Add Dish' : 'Add Product'}
          </button>
        </div>
      </motion.div>

      {/* ITEMS — Grouped by Category */}
      {items.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="p-20 text-center">
            <div className="w-24 h-24 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"><Package size={40} className="text-gray-300" /></div>
            <h3 className="text-2xl font-black tracking-tighter text-gray-900 mb-2">No Items Found</h3>
            <p className="text-gray-500 font-semibold max-w-sm mx-auto text-sm">You haven't added any products yet. Click the button above to get started.</p>
          </div>
        </motion.div>
      ) : (() => {
        const grouped: Record<string, typeof items> = {}
        items.forEach(item => {
          const key = item.category_name || 'Uncategorized'
          if (!grouped[key]) grouped[key] = []
          grouped[key].push(item)
        })
        return Object.entries(grouped).map(([catName, catItems], groupIdx) => (
          <motion.div key={catName} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: groupIdx * 0.06 }} className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden mb-6">
            <div className="flex items-center gap-3 px-5 py-3 md:px-6 md:py-4 border-b border-gray-100/80 bg-gray-50/60">
              <h2 className="text-xs md:text-sm font-black text-gray-900 tracking-tight">{catName}</h2>
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-white px-2.5 py-1 rounded-full border border-gray-200 text-gray-600 shadow-sm">{catItems.length} {catItems.length === 1 ? 'item' : 'items'}</span>
            </div>
            <div className="overflow-x-auto w-full scrollbar-none">
              <table className="w-full text-left">
                <thead className="bg-gray-50/30 border-b border-gray-100/50">
                  <tr>
                    <th className="p-4 text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Item</th>
                    <th className="p-4 text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Price</th>
                    {isFood ? (<><th className="p-4 text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:table-cell whitespace-nowrap">Prep</th><th className="p-4 text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:table-cell whitespace-nowrap">Tags</th></>) : (<><th className="p-4 text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:table-cell whitespace-nowrap">SKU</th><th className="p-4 text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:table-cell whitespace-nowrap">Stock</th></>)}
                    <th className="p-4 text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                    <th className="p-4 whitespace-nowrap" />
                  </tr>
                </thead>
                <motion.tbody variants={containerVariants} initial="hidden" animate="show" className="divide-y divide-gray-100/50">
                  {catItems.map((item) => {
                    const isActive = isFood ? item.is_available : item.is_active
                    return (
                      <motion.tr variants={rowVariants} key={item.id} className={`hover:bg-white/60 transition-colors group ${!isActive ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                        <td className="p-4 font-black text-gray-900 flex items-center gap-3">
                          <div className="w-12 h-12 bg-white rounded-[0.75rem] shadow-sm border border-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                            {item.image ? <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <ImageIcon className="text-gray-300" size={18} />}
                          </div>
                          <span className="flex items-center gap-2">{item.name}{!isActive && <EyeOff size={13} className="text-gray-400" />}</span>
                        </td>
                        <td className="p-4 font-black text-gray-600">Br {item.price}</td>
                        {isFood ? (
                          <>
                            <td className="p-4 hidden md:table-cell"><span className="bg-white shadow-sm border border-gray-100 text-orange-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center w-max gap-1"><Clock size={12} /> {item.preparation_time_minutes}m</span></td>
                            <td className="p-4 hidden md:table-cell"><div className="flex gap-1">{item.is_vegan && <span className="p-1 px-2 bg-green-50 rounded border border-green-100 text-green-600 text-[10px] font-bold flex items-center gap-1"><Leaf size={11} />Vegan</span>}{item.is_spicy && <span className="p-1 px-2 bg-red-50 rounded border border-red-100 text-red-600 text-[10px] font-bold flex items-center gap-1"><Flame size={11} />Spicy</span>}{!item.is_vegan && !item.is_spicy && <span className="text-xs text-gray-400">–</span>}</div></td>
                          </>
                        ) : (
                          <>
                            <td className="p-4 hidden md:table-cell"><span className="text-xs text-gray-500 font-mono font-bold">{item.sku || '–'}</span></td>
                            <td className="p-4 hidden md:table-cell"><span className={`px-3 py-1.5 rounded-xl border font-black text-xs shadow-sm ${item.stock_quantity > 5 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{item.stock_quantity}</span></td>
                          </>
                        )}
                        <td className="p-4 whitespace-nowrap"><button onClick={() => toggleVisibility(item)} className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border shadow-sm transition-all hover:-translate-y-0.5 ${isActive ? 'bg-gray-100 text-gray-900 border-gray-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>{isActive ? 'Active' : 'Hidden'}</button></td>
                        <td className="p-4 whitespace-nowrap"><div className="flex items-center justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => handleOpenEdit(item)} className="p-2 md:p-2.5 bg-white shadow-sm border border-gray-100 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 transition-colors"><Edit size={14} className="md:w-[15px] md:h-[15px]" /></button><button onClick={() => handleDelete(item.id)} className="p-2 md:p-2.5 bg-white shadow-sm border border-gray-100 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={14} className="md:w-[15px] md:h-[15px]" /></button></div></td>
                      </motion.tr>
                    )
                  })}
                </motion.tbody>
              </table>
            </div>
          </motion.div>
        ))
      })()}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center md:p-4">
          <div className="bg-white w-full h-full md:h-auto md:max-w-2xl rounded-none md:rounded-[2rem] p-6 md:p-8 shadow-2xl max-h-[100vh] md:max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200 pt-10 md:pt-8">
            <h2 className="text-2xl md:text-3xl font-black mb-6 md:mb-8 tracking-tight text-gray-900">
              {editingItemId ? (isFood ? 'Edit Dish' : 'Edit Product') : (isFood ? 'New Menu Item' : 'New Product')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block">Item Name</label>
                  <input required type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none font-bold focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all" placeholder="e.g. Classic Burger" />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block">Description</label>
                  <textarea value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none font-medium focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all resize-none min-h-[100px]" placeholder="Brief description of the item..."></textarea>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block">Price (Br)</label>
                  <input required type="number" step="0.01" value={formData.price || ''} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none font-black text-lg focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all text-gray-900" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block">Category</label>
                  <select required value={formData.category || ''} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none font-bold focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all appearance-none cursor-pointer">
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
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gray-900 shadow-inner"></div>
                  </label>
                </div>

                {/* IMAGE UPLOAD */}
                <div className="md:col-span-2 mb-4">
                  <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block">Featured Image</label>
                  <label className="group relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-all overflow-hidden bg-gray-50/50">
                    {formData.image ? (
                      <div className="absolute inset-0 w-full h-full bg-gray-100">
                        <img src={typeof formData.image === 'string' ? formData.image : URL.createObjectURL(formData.image)} className="w-full h-full object-contain opacity-80 group-hover:opacity-50 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="bg-black/80 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-xl">Change Image</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400 group-hover:text-gray-900 transition-colors">
                        <UploadCloud className="w-10 h-10 mb-3" />
                        <p className="text-sm font-bold">Click to upload image</p>
                        <p className="text-xs font-medium opacity-70 mt-1">JPEG, PNG, WEBP (Max 5MB)</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={e => setFormData({ ...formData, image: e.target.files?.[0] })} />
                  </label>
                </div>
              </div>

              {/* DYNAMIC FIELDS based on Store Type */}
              {isFood ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 bg-orange-50/50 p-6 rounded-2xl border border-orange-100">
                  <div className="col-span-2 lg:col-span-3">
                    <h4 className="text-sm font-black text-orange-900 tracking-tight flex items-center gap-2 mb-4"><Flame className="text-orange-500" size={18} /> Kitchen Details</h4>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-orange-900/60 tracking-widest uppercase mb-2 block flex items-center gap-1">Prep Time (Mins)</label>
                    <input type="number" value={formData.preparation_time_minutes || ''} onChange={e => setFormData({ ...formData, preparation_time_minutes: e.target.value })} className="w-full bg-white border border-orange-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-orange-500 font-bold text-orange-900" />
                  </div>
                  <label className="flex items-center justify-center gap-3 cursor-pointer p-4 bg-white rounded-xl border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                    <input type="checkbox" checked={formData.is_vegan || false} onChange={e => setFormData({ ...formData, is_vegan: e.target.checked })} className="w-5 h-5 accent-green-600" />
                    <span className="text-sm font-bold text-green-700 flex items-center gap-1.5"><Leaf size={16} /> Vegan</span>
                  </label>
                  <label className="flex items-center justify-center gap-3 cursor-pointer p-4 bg-white rounded-xl border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                    <input type="checkbox" checked={formData.is_spicy || false} onChange={e => setFormData({ ...formData, is_spicy: e.target.checked })} className="w-5 h-5 accent-red-600" />
                    <span className="text-sm font-bold text-red-700 flex items-center gap-1.5"><Flame size={16} /> Spicy</span>
                  </label>

                  {/* FOOD EXTRAS SECTION */}
                  <div className="col-span-2 lg:col-span-3 mt-4 pt-4 border-t border-orange-200 border-dashed space-y-4">
                    <h4 className="text-sm font-black text-orange-900 tracking-tight flex items-center gap-2 mb-2">Extras & Add-ons <span className="opacity-50 text-[10px] uppercase font-bold">(Optional)</span></h4>

                    {/* Existing extras */}
                    {pendingExtras.map((extra, idx) => (
                      <div key={extra.id} className="flex items-center justify-between bg-white border border-orange-200 p-3 rounded-xl shadow-sm">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{extra.name}</p>
                          <p className="text-xs font-black text-orange-600">+Br {parseFloat(extra.price).toFixed(2)}</p>
                        </div>
                        <button type="button" onClick={() => setPendingExtras(p => p.filter((_, i) => i !== idx))} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"><Trash2 size={14} /></button>
                      </div>
                    ))}

                    <div className="flex flex-col md:flex-row gap-3 bg-white p-3 rounded-xl border border-orange-200 mt-2">
                      <input type="text" value={newExtraName} onChange={e => setNewExtraName(e.target.value)} placeholder="Extra (e.g. Extra Cheese)" className="flex-1 bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm font-bold outline-none focus:ring-1 focus:ring-orange-500" />
                      <input type="number" value={newExtraPrice} onChange={e => setNewExtraPrice(e.target.value)} placeholder="Price (Br)" className="w-full md:w-32 bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm font-bold outline-none text-orange-600 focus:ring-1 focus:ring-orange-500" />
                      <button type="button" onClick={addPendingExtra} className="bg-orange-100 text-orange-700 hover:bg-orange-200 px-4 py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 whitespace-nowrap"><Plus size={16} /> Add Extra</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-200">
                  <div className="col-span-2">
                    <h4 className="text-sm font-black text-gray-900 tracking-tight flex items-center gap-2 mb-4"><Package className="text-gray-900" size={18} /> Inventory Details</h4>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-900/60 tracking-widest uppercase mb-2 block">SKU</label>
                    <input type="text" value={formData.sku || ''} onChange={e => setFormData({ ...formData, sku: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-gray-900 font-bold text-gray-900" placeholder="e.g. TSHIRT-01" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-900/60 tracking-widest uppercase mb-2 block">Stock Limit</label>
                    <input type="number" value={formData.stock_quantity || ''} onChange={e => setFormData({ ...formData, stock_quantity: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-gray-900 font-bold text-gray-900" />
                  </div>
                </div>
              )}

              {/* OPTIONS (SHARED BETWEEN RETAIL / FOOD) */}
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-200 space-y-4">
                <h4 className="text-sm font-black text-gray-900 tracking-tight flex items-center gap-2 mb-2">Variants & Custom Size Options <span className="opacity-50 text-[10px] uppercase font-bold">(Optional)</span></h4>
                <p className="text-xs text-gray-500 font-medium -mt-2 mb-4">Define product variants or customizations that your customers can select from.</p>

                {/* Existing Option Rows */}
                {pendingOptions.map((opt, idx) => (
                  <div key={opt.id} className="flex items-center justify-between bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-black text-gray-900">{opt.name}</p>
                        {opt.required && <span className="text-[9px] bg-red-100 text-red-700 px-2 py-0.5 rounded uppercase font-bold tracking-widest">Required</span>}
                      </div>
                      <p className="text-xs font-bold text-gray-900">Choices: {opt.choices.join(', ')}</p>
                    </div>
                    <button type="button" onClick={() => setPendingOptions(p => p.filter((_, i) => i !== idx))} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"><Trash2 size={16} /></button>
                  </div>
                ))}

                {/* Add New Option Area */}
                <div className="bg-white border border-gray-200 p-4 rounded-xl space-y-3 mt-4">
                  <input type="text" value={newOptionName} onChange={e => setNewOptionName(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm font-bold outline-none focus:ring-1 focus:ring-gray-900" placeholder="Variant Name (e.g. Size, Color, Delivery Mode)" />
                  <input type="text" value={newOptionChoices} onChange={e => setNewOptionChoices(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm font-bold outline-none focus:ring-1 focus:ring-gray-900" placeholder="Comma separated choices (e.g. Small, Medium, Large)" />
                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={newOptionRequired} onChange={e => setNewOptionRequired(e.target.checked)} className="w-4 h-4 accent-gray-900" />
                      <span className="text-xs font-bold text-gray-700">Selection is Required</span>
                    </label>
                    <button type="button" onClick={addPendingOption} className="bg-gray-100 text-gray-900 hover:bg-gray-200 px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"><Plus size={16} /> Add Variant</button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-100 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-black tracking-widest uppercase text-xs hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 bg-gray-900 text-white rounded-xl font-black tracking-widest uppercase text-xs shadow-xl shadow-[0_8px_20px_rgba(17,24,39,0.2)] hover:bg-black hover:scale-[1.02] transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:hover:scale-100">
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (editingItemId ? 'Update Item' : 'Save Item')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-end md:items-center p-0 md:p-4">
          <div className="bg-white w-full max-w-md rounded-t-[2rem] md:rounded-[2rem] p-6 md:p-8 shadow-2xl relative animate-in slide-in-from-bottom-5 md:zoom-in-95 duration-200">
            <h2 className="text-xl md:text-2xl font-black mb-4 md:mb-6 tracking-tight text-gray-900">New Category</h2>
            <form onSubmit={handleCreateCategory} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2 block">Category Name</label>
                <input required type="text" value={categoryName} onChange={e => setCategoryName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none font-bold focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all" placeholder="e.g. Beverages, Starters" />
              </div>
              <div className="flex gap-4 pt-4 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-black tracking-widest uppercase text-xs hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-4 bg-gray-900 text-white rounded-xl font-black tracking-widest uppercase text-xs shadow-xl shadow-[0_8px_20px_rgba(17,24,39,0.2)] hover:bg-black hover:scale-[1.02] transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:hover:scale-100">
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Loader2, Edit, Trash2, Tags } from 'lucide-react'
import { api } from '@/lib/api'
import { motion, Variants } from 'framer-motion'

export default function CategoriesPage() {
  const [store, setStore] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [order, setOrder] = useState(0) // Used for Food Menu sorting

  // 🌟 SMART FETCH: Automatically uses your Zustand Auth interceptors!
 const fetchDashboardData = async () => {
    try {
      setIsFetching(true)
      
      // 1. Get Store Profile (Safely handling DRF pagination)
      const storeRes = await api.get('/stores/manage/')
      const storeList = storeRes.data.results || storeRes.data || []
      const currentStore = storeList[0]

      // Safely exit if the user has no store
      if (!currentStore) {
        console.error("No store found for this user.")
        setIsFetching(false)
        return
      }

      setStore(currentStore)

      // 2. Fetch the correct categories based on engine
      const endpoint = currentStore.store_type === 'FOOD' ? '/food/categories/' : '/retail/categories/'
      const res = await api.get(`${endpoint}?limit=1000&_t=${Date.now()}`)
      
      const data = Array.isArray(res.data) ? res.data : res.data.results || []
      setCategories(data)
    } catch (err) {
      console.error("Failed to fetch categories", err)
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => { fetchDashboardData() }, [])

  const openCreate = () => { setEditingId(null); setName(''); setOrder(0); setIsDrawerOpen(true); }
  const openEdit = (cat: any) => { setEditingId(cat.id); setName(cat.name); setOrder(cat.order || 0); setIsDrawerOpen(true); }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this category? Products/Items in this category won't be deleted, but will become uncategorized.")) return;
    try {
      const endpoint = store.store_type === 'FOOD' ? `/food/categories/${id}/` : `/retail/categories/${id}/`
      await api.delete(endpoint)
      fetchDashboardData()
    } catch (err) { 
      alert("Error deleting category."); 
    }
  }

 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Failsafe: Don't submit if store hasn't loaded
    if (!store) {
      alert("Store profile is still loading or doesn't exist.")
      return
    }

    setIsLoading(true)
    try {
      const isFood = store.store_type === 'FOOD'
      const payload: any = { name }

      if (isFood) {
        payload.order = order
      } else {
        // Auto-generate the URL slug for Retail categories
        payload.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      }

      const baseEndpoint = isFood ? '/food/categories/' : '/retail/categories/'
      
      if (editingId) {
        await api.patch(`${baseEndpoint}${editingId}/`, payload)
      } else {
        await api.post(baseEndpoint, payload)
      }
      
      setIsDrawerOpen(false)
      fetchDashboardData()
    } catch (err: any) {
      console.error("API Error:", err)
      
      // Safely parse the error message
      const errorData = err.response?.data
      let errorMsg = err.message
      
      if (errorData) {
        if (errorData.detail) errorMsg = errorData.detail
        else if (typeof errorData === 'object') errorMsg = JSON.stringify(errorData)
        else errorMsg = String(errorData)
      }
      
      alert("Failed to save category:\n" + errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const isFood = store?.store_type === 'FOOD'

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const rowVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.3 } }
  }

  return (
    <main className="p-4 md:p-8 lg:p-12 mb-32 max-w-[1600px] mx-auto relative h-full">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="flex justify-between items-end mb-12 relative z-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mb-2">{isFood ? 'Menu Categories' : 'Categories'}</h1>
          <p className="text-gray-600 font-semibold text-lg">Organize your store's {isFood ? 'menu' : 'inventory'}.</p>
        </div>
        <button onClick={openCreate} className="bg-gray-900 text-white px-7 py-3.5 rounded-full font-black text-sm uppercase tracking-widest shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)] hover:bg-black transition-all flex items-center gap-2 transform hover:-translate-y-0.5">
          <Plus size={18} /> Add Category
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden max-w-4xl relative z-10 p-2">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase font-bold">
              <th className="p-4">Category Name</th>
              <th className="p-4">{isFood ? 'Sort Order' : 'URL Slug'}</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <motion.tbody variants={containerVariants} initial="hidden" animate="show" className="divide-y divide-gray-100/50">
            {isFetching ? (
              <tr><td colSpan={3} className="p-8 text-center text-gray-500"><Loader2 className="animate-spin mx-auto mb-2" /></td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={3} className="p-8 text-center text-gray-500 font-medium">No categories yet.</td></tr>
            ) : (
              categories.map((cat) => (
                <motion.tr variants={rowVariants} key={cat.id} className="hover:bg-white/60 transition-colors group">
                  <td className="p-5 font-black text-gray-900 flex items-center gap-4 text-lg">
                    <div className="w-12 h-12 bg-white text-gray-900 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform"><Tags size={20} /></div>
                    {cat.name}
                  </td>
                  <td className="p-5 text-gray-500 font-mono font-bold text-sm">
                    {isFood ? (
                      <span className="bg-white border text-gray-600 border-gray-100 shadow-sm px-3 py-1.5 rounded-xl">Order: {cat.order}</span>
                    ) : (
                      <span className="bg-white border text-gray-600 border-gray-100 shadow-sm px-3 py-1.5 rounded-xl">{cat.slug}</span>
                    )}
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(cat)} className="p-2.5 bg-white border border-gray-100 shadow-sm text-gray-400 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-colors"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(cat.id)} className="p-2.5 bg-white border border-gray-100 shadow-sm text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </motion.tbody>
        </table>
      </motion.div>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-black text-gray-900">{editingId ? 'Edit Category' : 'New Category'}</h2>
              <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-gray-400 hover:text-gray-900"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form id="cat-form" onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Category Name</label>
                  <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-gray-900 outline-none" placeholder="e.g. Hot Drinks, Electronics" />
                  {!isFood && <p className="text-xs text-gray-500 mt-2">The URL slug will be auto-generated.</p>}
                </div>

                {isFood && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Sort Order</label>
                    <input type="number" value={order} onChange={e => setOrder(parseInt(e.target.value) || 0)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-gray-900 outline-none" />
                    <p className="text-xs text-gray-500 mt-2">Lower numbers appear first on the menu.</p>
                  </div>
                )}
              </form>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50/50">
              <button type="submit" form="cat-form" disabled={isLoading} className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold shadow-md hover:bg-black transition-all flex justify-center disabled:opacity-70">
                {isLoading ? <Loader2 className="animate-spin" /> : 'Save Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
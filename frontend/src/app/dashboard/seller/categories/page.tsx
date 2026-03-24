'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Loader2, Edit, Trash2, Tags } from 'lucide-react'
import { api } from '@/lib/api'

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
      const res = await api.get(endpoint)
      
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

  return (
    <main className="p-8 relative h-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">{isFood ? 'Menu Categories' : 'Categories'}</h1>
          <p className="text-gray-500 font-medium mt-1">Organize your store's {isFood ? 'menu' : 'inventory'}.</p>
        </div>
        <button onClick={openCreate} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-all flex items-center gap-2">
          <Plus size={20} /> Add Category
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden max-w-4xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase font-bold">
              <th className="p-4">Category Name</th>
              <th className="p-4">{isFood ? 'Sort Order' : 'URL Slug'}</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isFetching ? (
              <tr><td colSpan={3} className="p-8 text-center text-gray-500"><Loader2 className="animate-spin mx-auto mb-2" /></td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={3} className="p-8 text-center text-gray-500 font-medium">No categories yet.</td></tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 group">
                  <td className="p-4 font-bold text-gray-900 flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center"><Tags size={18} /></div>
                    {cat.name}
                  </td>
                  <td className="p-4 text-gray-500 font-mono text-sm">
                    {isFood ? (
                      <span className="bg-gray-100 px-2 py-1 rounded-md font-bold text-gray-600">Order: {cat.order}</span>
                    ) : (
                      cat.slug
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(cat)} className="p-2 text-gray-400 hover:text-indigo-600"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(cat.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
                  <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Hot Drinks, Electronics" />
                  {!isFood && <p className="text-xs text-gray-500 mt-2">The URL slug will be auto-generated.</p>}
                </div>

                {isFood && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Sort Order</label>
                    <input type="number" value={order} onChange={e => setOrder(parseInt(e.target.value) || 0)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    <p className="text-xs text-gray-500 mt-2">Lower numbers appear first on the menu.</p>
                  </div>
                )}
              </form>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50/50">
              <button type="submit" form="cat-form" disabled={isLoading} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-all flex justify-center disabled:opacity-70">
                {isLoading ? <Loader2 className="animate-spin" /> : 'Save Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
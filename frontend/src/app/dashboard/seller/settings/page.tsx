'use client'

import React, { useState, useEffect } from 'react'
import { Loader2, Save, LayoutTemplate, Palette, Megaphone, CheckCircle2, ShoppingBag, MapPin, ChefHat, ExternalLink, Package } from 'lucide-react'
import { api } from '@/lib/api'

// ✨ 8 ULTRA-PREMIUM THEMES ✨
const THEMES = [
  { id: 'apple-dark', name: 'Cupertino Dark', bg: '#000000', text: '#F5F5F7', primary: '#2997FF' },
  { id: 'apple-light', name: 'Cupertino Light', bg: '#F5F5F7', text: '#1D1D1F', primary: '#0066CC' },
  { id: 'stripe', name: 'Fintech Slate', bg: '#0A2540', text: '#FFFFFF', primary: '#635BFF' },
  { id: 'luxury-gold', name: 'Maison Gold', bg: '#0A0A0A', text: '#FAFAFA', primary: '#D4AF37' },
  { id: 'minimal-mono', name: 'Pure Minimal', bg: '#FFFFFF', text: '#000000', primary: '#000000' },
  { id: 'emerald', name: 'Emerald Isle', bg: '#022C22', text: '#ECFDF5', primary: '#10B981' },
  { id: 'rose-glass', name: 'Blush Velvet', bg: '#FFF1F2', text: '#4C0519', primary: '#E11D48' },
  { id: 'oceanic', name: 'Deep Oceanic', bg: '#082F49', text: '#F0F9FF', primary: '#0EA5E9' },
]

export default function StoreSettingsPage() {
  const [store, setStore] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [activeTab, setActiveTab] = useState<'theme' | 'identity'>('theme')

  const [formData, setFormData] = useState({
    name: '', description: '', city: 'Addis Ababa',
    primary_color: '#000000', secondary_color: '#000000', background_color: '#FFFFFF',
    heading_font: 'Inter', announcement_is_active: false, announcement_text: '', announcement_color: '#000000',
  })

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 🌟 SMART FETCH: Safely extract store from DRF list
        const res = await api.get('/stores/manage/')
        const stores = Array.isArray(res.data) ? res.data : res.data.results || []
        
        if (stores.length > 0) {
          const s = stores[0]
          setStore(s) // Save full object to access store_type later
          
          setFormData({
            name: s.name || '', description: s.description || '', city: s.city || 'Addis Ababa',
            primary_color: s.primary_color || '#000000', secondary_color: s.secondary_color || '#000000', background_color: s.background_color || '#FFFFFF',
            heading_font: s.heading_font || 'Inter', announcement_is_active: s.announcement_is_active || false,
            announcement_text: s.announcement_text || '', announcement_color: s.announcement_color || '#000000',
          })
          setLogoPreview(s.logo)
          setBannerPreview(s.banner_image)
        }
      } catch (err) { 
        console.error(err) 
      } finally { 
        setIsFetching(false) 
      }
    }
    fetchDashboardData()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!store?.id) return
    setIsLoading(true)
    
    try {
      const data = new FormData()
      Object.entries(formData).forEach(([k, v]) => data.append(k, v.toString()))
      if (logoFile) data.append('logo', logoFile)
      if (bannerFile) data.append('banner_image', bannerFile)
      
      await api.patch(`/stores/manage/${store.id}/`, data, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      })
      alert("Premium Storefront Updated!")
    } catch (err) { 
      alert("Error saving your settings.") 
    } finally { 
      setIsLoading(false) 
    }
  }

  if (isFetching) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-gray-900" size={40} /></div>
  
  const isFood = store?.store_type === 'FOOD'

  return (
    <main className="p-4 md:p-8 max-w-[1600px] mx-auto h-full flex flex-col lg:flex-row gap-8 pb-32">
      
      {/* LEFT COLUMN: EDITOR */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black tracking-tight text-gray-900">Storefront Studio</h1>
              <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isFood ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'}`}>
                {isFood ? <ChefHat size={12}/> : <Package size={12}/>}
                {store?.store_type} Engine
              </span>
            </div>
            <p className="text-gray-500 mt-1 font-medium text-sm">Design your luxury shopping experience.</p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            {store?.slug && (
              <a 
                href={`http://localhost:3000/store/${store.slug}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-100 text-gray-700 px-5 py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
              >
                <ExternalLink size={16} /> View Live
              </a>
            )}
            <button onClick={handleSave} disabled={isLoading} className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 flex items-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-70">
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Publish
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row flex-1">
          {/* TABS */}
          <div className="w-full md:w-56 bg-gray-50/50 border-r border-gray-100 p-4 flex flex-col gap-2">
            <button onClick={() => setActiveTab('theme')} className={`flex items-center gap-3 w-full p-4 rounded-2xl font-bold transition-all text-sm ${activeTab === 'theme' ? 'bg-white shadow-sm border border-gray-200 text-black' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}>
               <Palette size={18} /> Colors & Layout
            </button>
            <button onClick={() => setActiveTab('identity')} className={`flex items-center gap-3 w-full p-4 rounded-2xl font-bold transition-all text-sm ${activeTab === 'identity' ? 'bg-white shadow-sm border border-gray-200 text-black' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}>
               <LayoutTemplate size={18} /> Brand Identity
            </button>
          </div>

          {/* CONTENT */}
          <div className="flex-1 p-6 md:p-10 overflow-y-auto">
            {activeTab === 'theme' && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-xl font-black mb-6 flex items-center gap-2"><Palette size={20} className="text-gray-400"/> Designer Palettes</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-12">
                  {THEMES.map(t => {
                    const isActive = formData.background_color === t.bg && formData.primary_color === t.primary
                    return (
                      <div key={t.id} onClick={() => setFormData({...formData, background_color: t.bg, secondary_color: t.text, primary_color: t.primary, announcement_color: t.primary})} className={`cursor-pointer group p-4 rounded-3xl border-2 transition-all duration-300 ${isActive ? 'border-black bg-gray-50 scale-[1.02] shadow-md' : 'border-gray-100 hover:border-gray-300'}`}>
                        <div className="h-16 rounded-2xl flex overflow-hidden border border-black/5 mb-4 shadow-inner">
                          <div className="flex-1" style={{backgroundColor: t.bg}}></div>
                          <div className="w-12 shrink-0" style={{backgroundColor: t.primary}}></div>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-gray-900">{t.name}</p>
                          {isActive && <CheckCircle2 size={16} className="text-black"/>}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <h2 className="text-xl font-black mb-6 pt-8 border-t border-gray-100 flex items-center gap-2"><Megaphone size={20} className="text-gray-400"/> Announcement Bar</h2>
                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <input type="checkbox" checked={formData.announcement_is_active} onChange={e => setFormData({...formData, announcement_is_active: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black cursor-pointer" />
                    <span className="font-bold text-gray-700 text-sm">Enable Top Bar</span>
                  </div>
                  {formData.announcement_is_active && (
                    <input type="text" value={formData.announcement_text} onChange={e => setFormData({...formData, announcement_text: e.target.value})} placeholder="e.g. FREE SHIPPING ON ALL ORDERS" className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-5 outline-none font-bold text-sm focus:border-black focus:ring-1 focus:ring-black transition-all" />
                  )}
                </div>
              </div>
            )}

            {activeTab === 'identity' && (
              <div className="animate-in fade-in duration-300 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                    <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Store Logo</label>
                    <input type="file" onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if(f){ setLogoFile(f); setLogoPreview(URL.createObjectURL(f)) } }} className="w-full file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-white file:text-black file:shadow-sm cursor-pointer text-sm text-gray-500" />
                  </div>
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                    <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Hero Banner</label>
                    <input type="file" onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if(f){ setBannerFile(f); setBannerPreview(URL.createObjectURL(f)) } }} className="w-full file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-white file:text-black file:shadow-sm cursor-pointer text-sm text-gray-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Store Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-5 outline-none font-black text-xl text-gray-900 focus:border-black focus:ring-1 focus:ring-black transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Store Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-5 outline-none font-medium text-sm text-gray-900 focus:border-black focus:ring-1 focus:ring-black min-h-[120px] transition-all" />
                </div>
                
                {/* Font Selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Heading Font</label>
                  <select value={formData.heading_font} onChange={(e) => setFormData({...formData, heading_font: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-5 outline-none font-bold text-sm text-gray-900 focus:border-black focus:ring-1 focus:ring-black cursor-pointer">
                    <option value="Inter">Inter (Modern & Clean)</option>
                    <option value="Playfair Display">Playfair Display (Elegant Serif)</option>
                    <option value="Space Grotesk">Space Grotesk (Bold & Unique)</option>
                    <option value="Outfit">Outfit (Tech & Startup)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: LIVE GLASSMORPHISM PREVIEW */}
      <div className="w-full lg:w-[420px] shrink-0">
        <div className="sticky top-8 bg-gray-200 rounded-[3.5rem] p-3.5 shadow-2xl border-[8px] border-gray-900 h-[820px] flex flex-col overflow-hidden relative">
          
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-gray-900 rounded-b-3xl z-[60]"></div>
          
          {/* Phone Screen */}
          <div className="flex-1 rounded-[2.8rem] overflow-y-auto no-scrollbar relative transition-colors duration-700" style={{ backgroundColor: formData.background_color, color: formData.secondary_color, fontFamily: `"${formData.heading_font}", sans-serif` }}>
            
            {/* Announcement Mock */}
            {formData.announcement_is_active && formData.announcement_text && (
              <div className="w-full py-1.5 text-[8px] font-black tracking-widest uppercase text-center" style={{ backgroundColor: formData.announcement_color, color: formData.background_color }}>
                {formData.announcement_text}
              </div>
            )}

            {/* Nav Mock */}
            <div className="sticky top-0 z-50 w-full p-4 backdrop-blur-xl border-b flex justify-between items-center" style={{ backgroundColor: `${formData.background_color}CC`, borderColor: `${formData.secondary_color}15` }}>
               <div className="font-black text-sm tracking-tight">{formData.name || "Brand"}</div>
               {isFood ? <ChefHat size={18} /> : <ShoppingBag size={18} />}
            </div>

            {/* Hero Mock */}
            <div className="h-56 relative flex items-center justify-center m-2 rounded-3xl overflow-hidden shadow-md">
               {bannerPreview ? <img src={bannerPreview} className="absolute inset-0 w-full h-full object-cover" /> : <div className="absolute inset-0 opacity-20" style={{ backgroundColor: formData.primary_color }}></div>}
               <div className="absolute inset-0 bg-black/40"></div>
               <div className="relative z-10 flex flex-col items-center">
                 <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-2 overflow-hidden shadow-xl border border-white/20">
                   {logoPreview ? <img src={logoPreview} className="w-full h-full object-cover" /> : (isFood ? <ChefHat size={20} className="text-white" /> : <ShoppingBag size={20} className="text-white" />)}
                 </div>
                 <h3 className="text-white font-black text-2xl tracking-tight shadow-black/50 drop-shadow-md">{formData.name || "Store Name"}</h3>
               </div>
            </div>

            {/* Grid Mock */}
            <div className="px-4 mt-6 pb-8">
               <div className="grid grid-cols-2 gap-3">
                 {[1, 2, 3, 4].map(i => (
                    <div key={i} className="rounded-3xl overflow-hidden border shadow-sm group" style={{ borderColor: `${formData.secondary_color}10`, backgroundColor: `${formData.secondary_color}05` }}>
                       <div className={`aspect-[4/5] bg-black/5 relative ${isFood ? 'rounded-b-none' : ''}`}>
                         <div className="absolute bottom-2 left-2 right-2 p-2 rounded-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-[10px] font-bold tracking-widest uppercase" style={{ backgroundColor: `${formData.primary_color}DD`, color: '#fff' }}>Add</div>
                       </div>
                       <div className="p-3">
                         <div className="h-3 w-3/4 rounded-full mb-2 opacity-20" style={{ backgroundColor: formData.secondary_color }}></div>
                         <div className="h-4 w-1/3 rounded-full opacity-80" style={{ backgroundColor: formData.primary_color }}></div>
                       </div>
                    </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </div>

    </main>
  )
}
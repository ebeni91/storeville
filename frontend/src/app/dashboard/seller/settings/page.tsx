'use client'

import { useState, useEffect } from 'react'
import { Loader2, Save, LayoutTemplate, Palette, Megaphone, ShoppingBag, MapPin } from 'lucide-react'
import { api } from '@/lib/api'

// --- 💎 EXTRAORDINARY PREMIUM THEMES ---
const THEME_PRESETS = [
  { id: 'luxe-obsidian', name: 'Luxe Obsidian', primary: '#D4AF37', secondary: '#171717', background: '#FAFAFA' }, 
  { id: 'nordic-minimal', name: 'Nordic Minimal', primary: '#0F172A', secondary: '#334155', background: '#F8FAFC' }, 
  { id: 'terracotta-organic', name: 'Terracotta', primary: '#C25934', secondary: '#43281C', background: '#FFFBF7' }, 
  { id: 'matcha-zen', name: 'Matcha Zen', primary: '#658A64', secondary: '#2C3D2B', background: '#FDFDF9' }, 
  { id: 'midnight-onyx', name: 'Midnight Onyx', primary: '#FFFFFF', secondary: '#E5E5E5', background: '#0A0A0A' }, 
  { id: 'blush-boutique', name: 'Blush Boutique', primary: '#DB2777', secondary: '#4C1D95', background: '#FDF2F8' }, 
]

export default function StoreSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [storeId, setStoreId] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    name: 'My Awesome Store',
    description: 'Welcome to our premium storefront.',
    city: 'Addis Ababa',
    theme: 'modern',
    primary_color: '#D4AF37',
    secondary_color: '#171717',
    background_color: '#FAFAFA',
    heading_font: 'Inter',
    card_style: 'rounded-shadow',
    announcement_is_active: false,
    announcement_text: '✦ FREE SHIPPING ON ALL ORDERS OVER BR 1000 ✦',
    announcement_color: '#171717',
  })

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await api.get('/stores/manage/')
        const stores = Array.isArray(res.data) ? res.data : res.data.results || []
        if (stores.length > 0) {
          const store = stores[0]
          setStoreId(store.id)
          setFormData({
            name: store.name || '',
            description: store.description || '',
            city: store.city || 'Addis Ababa',
            theme: store.theme || 'modern',
            primary_color: store.primary_color || '#D4AF37',
            secondary_color: store.secondary_color || '#171717',
            background_color: store.background_color || '#FAFAFA',
            heading_font: store.heading_font || 'Inter',
            card_style: store.card_style || 'luxury-glass',
            announcement_is_active: store.announcement_is_active || false,
            announcement_text: store.announcement_text || '',
            announcement_color: store.announcement_color || '#171717',
          })
          setLogoPreview(store.logo)
          setBannerPreview(store.banner)
        }
      } catch (err) {
        console.error("Failed to fetch store settings", err)
      } finally {
        setIsFetching(false)
      }
    }
    fetchStore()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    const checked = (e.target as HTMLInputElement).checked
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const applyThemePreset = (presetId: string) => {
    const preset = THEME_PRESETS.find(p => p.id === presetId)
    if (preset) {
      setFormData(prev => ({
        ...prev,
        primary_color: preset.primary,
        secondary_color: preset.secondary,
        background_color: preset.background,
        announcement_color: preset.secondary 
      }))
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setLogoFile(file); setLogoPreview(URL.createObjectURL(file)) }
  }

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setBannerFile(file); setBannerPreview(URL.createObjectURL(file)) }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeId) return

    setIsLoading(true)
    try {
      const data = new FormData()
      Object.entries(formData).forEach(([key, value]) => { data.append(key, value.toString()) })
      if (logoFile) data.append('logo', logoFile)
      if (bannerFile) data.append('banner', bannerFile)

      await api.patch(`/stores/manage/${storeId}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      alert("Store settings saved successfully! Your storefront is updated.")
    } catch (err) {
      console.error(err)
      alert("Failed to save settings.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>

  return (
    <main className="p-4 md:p-8 h-full flex flex-col xl:flex-row gap-8">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        .animate-marquee { display: inline-block; white-space: nowrap; animation: marquee 15s linear infinite; }
      `}} />

      {/* LEFT COLUMN: SETTINGS */}
      <div className="flex-1 max-w-3xl overflow-y-auto pb-20 pr-2">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Store Design</h1>
            <p className="text-gray-500 font-medium mt-1">Customize your premium storefront.</p>
          </div>
          <button onClick={handleSave} disabled={isLoading} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-all flex items-center gap-2">
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} Save
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2"><Palette className="text-indigo-600" size={20} /> Designer Themes</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {THEME_PRESETS.map((preset) => {
                const isSelected = formData.primary_color === preset.primary && formData.background_color === preset.background
                return (
                  <button key={preset.id} type="button" onClick={() => applyThemePreset(preset.id)} className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${isSelected ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100' : 'border-gray-100 hover:border-gray-300 bg-white'}`}>
                    <div className="w-full h-12 rounded-lg shadow-inner flex overflow-hidden border border-gray-200/50">
                       <div className="w-1/3 h-full" style={{ backgroundColor: preset.background }}></div>
                       <div className="w-1/3 h-full" style={{ backgroundColor: preset.primary }}></div>
                       <div className="w-1/3 h-full" style={{ backgroundColor: preset.secondary }}></div>
                    </div>
                    <span className="text-xs font-bold text-gray-700">{preset.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2"><LayoutTemplate className="text-indigo-600" size={20} /> Store Identity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Store Logo</label>
                <input type="file" accept="image/*" onChange={handleLogoChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Header Banner</label>
                <input type="file" accept="image/*" onChange={handleBannerChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Store Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">About Us</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2"><Megaphone className="text-indigo-600" size={20} /> Advanced Features</h2>
            <div className="mb-6">
               <label className="block text-sm font-bold text-gray-700 mb-2">Product Card Style</label>
               <select name="card_style" value={formData.card_style} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 outline-none font-medium">
                  <option value="luxury-glass">Luxury Glass (Modern Grid)</option>
                  <option value="minimal-border">Minimalist (Thin Borders)</option>
                  <option value="bold-flat">Bold & Flat (High Contrast)</option>
               </select>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center gap-3 mb-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="announcement_is_active" checked={formData.announcement_is_active} onChange={handleInputChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
                <span className="font-bold text-gray-700">Scrolling Marquee Bar</span>
              </div>
              {formData.announcement_is_active && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Marquee Text</label>
                  <input type="text" name="announcement_text" value={formData.announcement_text} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 outline-none mb-3 font-mono text-sm" />
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* RIGHT COLUMN: THE LIVE PREVIEW (NOW WITH THE NEW LUXURY DESIGN!) */}
      <div className="xl:w-[450px] shrink-0 sticky top-8 self-start">
        <div className="bg-gray-200 rounded-[2.5rem] p-3 shadow-2xl border-[6px] border-gray-800 h-[800px] flex flex-col overflow-hidden relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-3xl z-50"></div>

          <div className="flex-1 rounded-[2rem] overflow-y-auto no-scrollbar relative transition-colors duration-500" style={{ backgroundColor: formData.background_color, color: formData.secondary_color }}>
            
            {formData.announcement_is_active && (
              <div className="w-full py-2 overflow-hidden relative text-[10px] font-black tracking-widest uppercase" style={{ backgroundColor: formData.announcement_color, color: formData.background_color }}>
                <div className="animate-marquee">{formData.announcement_text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{formData.announcement_text}</div>
              </div>
            )}

            <div className="w-full h-32 relative overflow-hidden flex items-center justify-center">
               {bannerPreview ? <img src={bannerPreview} className="w-full h-full object-cover opacity-90" alt="Banner" /> : <div className="absolute inset-0 opacity-20 transition-colors duration-500" style={{ backgroundColor: formData.primary_color }}></div>}
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>

            <div className="px-5 relative -mt-10 mb-6 flex flex-col items-center text-center">
               <div className="w-20 h-20 bg-white rounded-full border-[3px] shadow-xl overflow-hidden flex items-center justify-center mb-3" style={{ borderColor: formData.background_color }}>
                 {logoPreview ? <img src={logoPreview} className="w-full h-full object-cover" alt="Logo" /> : <ShoppingBag size={24} style={{ color: formData.primary_color }} />}
               </div>
               <h3 className="text-2xl font-black tracking-tight leading-none mb-2">{formData.name || "Store Name"}</h3>
               <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 flex items-center gap-1 justify-center"><MapPin size={10}/> {formData.city}</p>
            </div>

            <div className="px-5 text-sm opacity-80 mb-8 line-clamp-2 text-center font-medium leading-relaxed">
              {formData.description || "Your store description will appear here..."}
            </div>

            <div className="px-5 pb-8">
               <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 text-center">Curated Collection</h4>
               <div className="grid grid-cols-2 gap-4">
                 {[1, 2].map((i) => (
                    
                    // NEW PREVIEW PRODUCT CARDS
                    <div key={i} className="group flex flex-col overflow-hidden transition-all duration-300">
                       
                       {/* 4/5 Aspect Ratio Image Wrapper */}
                       <div 
                         className={`aspect-[4/5] relative overflow-hidden bg-black/5 ${formData.card_style === 'luxury-glass' ? 'rounded-xl border shadow-sm' : formData.card_style === 'minimal-border' ? 'rounded-none border-b' : 'rounded-xl border-2'}`}
                         style={{ backgroundColor: `${formData.secondary_color}05`, borderColor: `${formData.secondary_color}10` }}
                       >
                         {/* Badge */}
                         <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-white/90 backdrop-blur-sm rounded-sm text-[8px] font-black uppercase tracking-widest text-black shadow-sm">NEW</div>
                         
                         {/* Hover Effect Simulation */}
                         <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3">
                            <div className="w-full py-2 rounded-sm font-black text-[8px] tracking-widest uppercase text-center" style={{ backgroundColor: formData.primary_color, color: formData.background_color }}>Add To Cart</div>
                         </div>
                       </div>

                       {/* Content Below Image */}
                       <div className="p-3 flex flex-col items-center text-center">
                         <div className="h-2 w-3/4 rounded mb-2" style={{ backgroundColor: `${formData.secondary_color}40` }}></div>
                         <div className="h-1 w-1/2 rounded mb-3" style={{ backgroundColor: `${formData.secondary_color}20` }}></div>
                         <div className="font-black text-sm tracking-tighter" style={{ color: formData.secondary_color }}>Br 2,500</div>
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
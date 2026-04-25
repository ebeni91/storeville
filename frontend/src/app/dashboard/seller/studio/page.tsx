'use client'

import React, { useState, useEffect } from 'react'
import {
  Loader2, Save, LayoutTemplate, Palette, Megaphone,
  CheckCircle2, ShoppingBag, ChefHat, ExternalLink, Package,
  Clock, Eye, X, ChevronDown,
} from 'lucide-react'
import { api } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'

// ── All 14 premium themes (synced with mobile app) ──────────────────────────
const THEMES = [
  { id: 'apple-dark',      name: 'Cupertino Dark',   desc: "Apple's signature obsidian",     bg: '#000000', text: '#F5F5F7', primary: '#2997FF'  },
  { id: 'apple-light',     name: 'Cupertino Light',  desc: 'Clean daylight silicon',          bg: '#F5F5F7', text: '#1D1D1F', primary: '#0066CC'  },
  { id: 'stripe',          name: 'Fintech Slate',    desc: 'Bold financial confidence',       bg: '#0A2540', text: '#FFFFFF',  primary: '#635BFF'  },
  { id: 'luxury-gold',     name: 'Maison Gold',      desc: 'Parisian haute couture',          bg: '#0A0A0A', text: '#FAFAFA',  primary: '#D4AF37'  },
  { id: 'minimal-mono',    name: 'Pure Minimal',     desc: 'Zen typographic clarity',         bg: '#FFFFFF', text: '#000000',  primary: '#000000'  },
  { id: 'emerald',         name: 'Emerald Isle',     desc: 'Lush botanical luxury',           bg: '#022C22', text: '#ECFDF5',  primary: '#10B981'  },
  { id: 'rose-glass',      name: 'Blush Velvet',     desc: 'Romantic soft couture',           bg: '#FFF1F2', text: '#4C0519',  primary: '#E11D48'  },
  { id: 'oceanic',         name: 'Deep Oceanic',     desc: 'Pacific horizon depth',           bg: '#082F49', text: '#F0F9FF',  primary: '#0EA5E9'  },
  { id: 'terracotta',      name: 'Terra Cotta',      desc: 'Warm artisan earthenware',        bg: '#2C1810', text: '#FDF4EE',  primary: '#E2714A'  },
  { id: 'midnight-cherry', name: 'Midnight Cherry',  desc: 'Sultry after-hours allure',       bg: '#1A0010', text: '#FFE4EF',  primary: '#D1006C'  },
  { id: 'forest-sage',     name: 'Forest Sage',      desc: 'Scandinavian wellness calm',      bg: '#1C2B1E', text: '#E8F5E9',  primary: '#6DA86F'  },
  { id: 'cosmic-purple',   name: 'Cosmic Purple',    desc: 'Deep space futurism',             bg: '#0D0719', text: '#EDE0FF',  primary: '#A855F7'  },
  { id: 'warm-sand',       name: 'Warm Sand',        desc: 'Mediterranean coastal ease',      bg: '#FDF7F0', text: '#3D2B1F',  primary: '#C97B2E'  },
  { id: 'neon-cyber',      name: 'Neon Cyber',       desc: 'Tokyo streetwear digital edge',   bg: '#0A0A14', text: '#E4E4F7',  primary: '#39FF14'  },
]

const TABS = [
  { key: 'theme',    label: 'Palette',  icon: <Palette    size={18} /> },
  { key: 'identity', label: 'Identity', icon: <LayoutTemplate size={18} /> },
  { key: 'hours',    label: 'Hours',    icon: <Clock      size={18} /> },
]

export default function StoreSettingsPage() {
  const [store,     setStore]      = useState<any>(null)
  const [isLoading, setIsLoading]  = useState(false)
  const [isFetching,setIsFetching] = useState(true)
  const [activeTab, setActiveTab]  = useState<'theme' | 'identity' | 'hours'>('theme')
  const [showMobilePreview, setShowMobilePreview] = useState(false)

  const [formData, setFormData] = useState({
    name: '', description: '', city: 'Addis Ababa',
    primary_color: '#000000', secondary_color: '#000000', background_color: '#FFFFFF',
    heading_font: 'Inter', announcement_is_active: false, announcement_text: '', announcement_color: '#000000',
    working_days: [] as string[], opening_time: '', closing_time: '', delivery_hours: '',
  })

  const [logoFile,      setLogoFile]      = useState<File | null>(null)
  const [bannerFile,    setBannerFile]    = useState<File | null>(null)
  const [logoPreview,   setLogoPreview]   = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res   = await api.get('/stores/manage/')
        const stores = Array.isArray(res.data) ? res.data : res.data.results || []
        if (stores.length > 0) {
          const s = stores[0]
          setStore(s)
          setFormData({
            name: s.name || '', description: s.description || '', city: s.city || 'Addis Ababa',
            primary_color: s.primary_color || '#000000', secondary_color: s.secondary_color || '#000000',
            background_color: s.background_color || '#FFFFFF',
            heading_font: s.heading_font || 'Inter',
            announcement_is_active: s.announcement_is_active || false,
            announcement_text: s.announcement_text || '',
            announcement_color: s.announcement_color || '#000000',
            working_days: Array.isArray(s.working_days) ? s.working_days : [],
            opening_time: s.opening_time || '', closing_time: s.closing_time || '',
            delivery_hours: s.delivery_hours || '',
          })
          setLogoPreview(s.logo)
          setBannerPreview(s.banner_image)
        }
      } catch (err) { console.error(err) }
      finally { setIsFetching(false) }
    }
    load()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!store?.id) return
    setIsLoading(true)
    try {
      const data = new FormData()
      Object.entries(formData).forEach(([k, v]) => {
        if (k === 'working_days') data.append(k, JSON.stringify(v))
        else data.append(k, v.toString())
      })
      if (logoFile)   data.append('logo', logoFile)
      if (bannerFile) data.append('banner_image', bannerFile)
      await api.patch(`/stores/manage/${store.id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      alert('Premium Storefront Updated!')
    } catch { alert('Error saving your settings.') }
    finally { setIsLoading(false) }
  }

  const currentTheme = THEMES.find(t =>
    formData.background_color === t.bg && formData.primary_color === t.primary
  ) || null

  const applyTheme = (t: typeof THEMES[0]) => setFormData(prev => ({
    ...prev, background_color: t.bg, secondary_color: t.text,
    primary_color: t.primary, announcement_color: t.primary,
  }))

  if (isFetching) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="animate-spin text-gray-900" size={40} />
    </div>
  )

  const isFood = store?.store_type === 'FOOD'

  // ── Phone Preview ───────────────────────────────────────────────────────────
  const renderPhonePreview = () => (
    <div className="w-full max-w-[280px] mx-auto md:max-w-none">
      <div className="bg-gray-200 rounded-[2.8rem] p-3 shadow-2xl border-[7px] border-gray-900 aspect-[9/19] flex flex-col overflow-hidden relative">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-2xl z-[60]" />
        {/* Screen */}
        <div
          className="flex-1 rounded-[2rem] overflow-y-auto no-scrollbar"
          style={{ backgroundColor: formData.background_color, color: formData.secondary_color, fontFamily: `"${formData.heading_font}", sans-serif` }}
        >
          {formData.announcement_is_active && formData.announcement_text && (
            <div className="py-1.5 text-[7px] font-black tracking-widest uppercase text-center"
              style={{ backgroundColor: formData.announcement_color, color: formData.background_color }}>
              {formData.announcement_text}
            </div>
          )}
          <div className="sticky top-0 z-50 p-3 backdrop-blur-xl border-b flex justify-between items-center"
            style={{ backgroundColor: `${formData.background_color}CC`, borderColor: `${formData.secondary_color}15` }}>
            <div className="font-black text-[11px] tracking-tight">{formData.name || 'Brand'}</div>
            {isFood ? <ChefHat size={14} /> : <ShoppingBag size={14} />}
          </div>
          <div className="h-40 relative flex items-center justify-center m-2 rounded-2xl overflow-hidden shadow-md">
            {bannerPreview
              ? <img src={bannerPreview} className="absolute inset-0 w-full h-full object-cover" />
              : <div className="absolute inset-0 opacity-20" style={{ backgroundColor: formData.primary_color }} />}
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-1.5 overflow-hidden border border-white/20">
                {logoPreview ? <img src={logoPreview} className="w-full h-full object-cover" /> : (isFood ? <ChefHat size={14} className="text-white" /> : <ShoppingBag size={14} className="text-white" />)}
              </div>
              <h3 className="text-white font-black text-lg tracking-tight drop-shadow-md">{formData.name || 'Store'}</h3>
              {formData.working_days.length > 0 && (
                <span className={`mt-1 text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${formData.opening_time && formData.closing_time ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'}`}>
                  {formData.opening_time && formData.closing_time ? '● Open' : '● Closed'}
                </span>
              )}
            </div>
          </div>
          <div className="px-3 mt-4 pb-6">
            <div className="grid grid-cols-2 gap-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="rounded-2xl overflow-hidden border shadow-sm"
                  style={{ borderColor: `${formData.secondary_color}10`, backgroundColor: `${formData.secondary_color}05` }}>
                  <div className="aspect-square bg-black/5 relative">
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 p-1.5 rounded-lg text-[7px] font-bold text-center"
                      style={{ backgroundColor: `${formData.primary_color}DD`, color: '#fff' }}>Add</div>
                  </div>
                  <div className="p-2">
                    <div className="h-2 w-3/4 rounded-full mb-1 opacity-20" style={{ backgroundColor: formData.secondary_color }} />
                    <div className="h-2.5 w-1/3 rounded-full opacity-80" style={{ backgroundColor: formData.primary_color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // ── Tab Content ─────────────────────────────────────────────────────────────
  const renderTabContent = () => (
    <AnimatePresence mode="wait">
      {activeTab === 'theme' && (
        <motion.div key="theme" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-8">
          
          <div>
            <h2 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
              <Palette size={16} className="text-gray-400" /> Designer Palette
            </h2>

            {/* Current theme swatch */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-200 mb-3">
              <div className="flex rounded-xl overflow-hidden h-10 w-20 shrink-0 border border-black/10 shadow-sm">
                <div className="flex-1" style={{ backgroundColor: currentTheme?.bg ?? formData.background_color }} />
                <div className="w-6" style={{ backgroundColor: currentTheme?.primary ?? formData.primary_color }} />
              </div>
              <div className="min-w-0">
                <p className="font-black text-sm text-gray-900 truncate">{currentTheme?.name ?? 'Custom'}</p>
                <p className="text-xs text-gray-500 truncate">{currentTheme?.desc ?? 'Custom palette applied'}</p>
              </div>
              {currentTheme && <CheckCircle2 size={18} className="text-green-500 shrink-0 ml-auto" />}
            </div>

            {/* Dropdown */}
            <div className="relative">
              <select
                value={currentTheme?.id ?? ''}
                onChange={e => { const t = THEMES.find(t => t.id === e.target.value); if (t) applyTheme(t) }}
                className="w-full appearance-none bg-white border border-gray-200 rounded-2xl py-4 px-5 pr-12 font-bold text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 cursor-pointer transition-all"
              >
                <option value="" disabled>Select a palette…</option>
                {THEMES.map(t => (
                  <option key={t.id} value={t.id}>{t.name} — {t.desc}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* All palettes as mini swatches */}
            <div className="mt-4 grid grid-cols-7 gap-2">
              {THEMES.map(t => {
                const isSelected = currentTheme?.id === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    title={t.name}
                    onClick={() => applyTheme(t)}
                    className={`flex flex-col gap-0.5 p-1 rounded-xl transition-all border-2 ${isSelected ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent hover:border-gray-200'}`}
                  >
                    <div className="flex rounded-lg overflow-hidden h-6 w-full border border-black/5">
                      <div className="flex-1" style={{ backgroundColor: t.bg }} />
                      <div className="w-2.5" style={{ backgroundColor: t.primary }} />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h2 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
              <Megaphone size={16} className="text-gray-400" /> Announcement Bar
            </h2>
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={formData.announcement_is_active}
                  onChange={e => setFormData({ ...formData, announcement_is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black cursor-pointer" />
                <span className="font-bold text-sm text-gray-700">Enable Top Announcement Bar</span>
              </label>
              {formData.announcement_is_active && (
                <input type="text" value={formData.announcement_text}
                  onChange={e => setFormData({ ...formData, announcement_text: e.target.value })}
                  placeholder="e.g. FREE SHIPPING ON ALL ORDERS"
                  className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 outline-none font-bold text-sm focus:border-black focus:ring-1 focus:ring-black transition-all" />
              )}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'identity' && (
        <motion.div key="identity" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Store Logo</label>
              <input type="file" onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)) } }}
                className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-white file:text-black file:shadow-sm cursor-pointer text-sm text-gray-500" />
            </div>
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Hero Banner</label>
              <input type="file" onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) { setBannerFile(f); setBannerPreview(URL.createObjectURL(f)) } }}
                className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-white file:text-black file:shadow-sm cursor-pointer text-sm text-gray-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Store Name</label>
            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-5 outline-none font-black text-xl text-gray-900 focus:border-black focus:ring-1 focus:ring-black transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Store Description</label>
            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-5 outline-none font-medium text-sm text-gray-900 focus:border-black focus:ring-1 focus:ring-black min-h-[100px] transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Heading Font</label>
            <select value={formData.heading_font} onChange={e => setFormData({ ...formData, heading_font: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-5 outline-none font-bold text-sm text-gray-900 focus:border-black focus:ring-1 focus:ring-black cursor-pointer">
              <option value="Inter">Inter — Modern & Clean</option>
              <option value="Playfair Display">Playfair Display — Elegant Serif</option>
              <option value="Space Grotesk">Space Grotesk — Bold & Unique</option>
              <option value="Outfit">Outfit — Tech & Startup</option>
            </select>
          </div>
        </motion.div>
      )}

      {activeTab === 'hours' && (
        <motion.div key="hours" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
          <div>
            <h2 className="text-base font-black text-gray-900 mb-1 flex items-center gap-2"><Clock size={16} className="text-gray-400" /> Working Hours</h2>
            <p className="text-sm text-gray-500 font-medium mb-5">Set your open days and trading hours.</p>
            <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Open Days</label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-5">
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => {
                const checked = formData.working_days.includes(day)
                return (
                  <button key={day} type="button"
                    onClick={() => setFormData(p => ({ ...p, working_days: checked ? p.working_days.filter(d => d !== day) : [...p.working_days, day] }))}
                    className={`py-3 rounded-2xl font-black text-xs tracking-widest uppercase transition-all border ${checked ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-400'}`}>
                    {day}
                  </button>
                )
              })}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Opens</label>
                <input type="time" value={formData.opening_time} onChange={e => setFormData({ ...formData, opening_time: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-5 outline-none font-black text-gray-900 focus:border-black focus:ring-1 focus:ring-black" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Closes</label>
                <input type="time" value={formData.closing_time} onChange={e => setFormData({ ...formData, closing_time: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-5 outline-none font-black text-gray-900 focus:border-black focus:ring-1 focus:ring-black" />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Display Label (optional)</label>
              <input type="text" value={formData.delivery_hours} onChange={e => setFormData({ ...formData, delivery_hours: e.target.value })}
                placeholder="e.g. 09:00 AM – 10:00 PM"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-5 outline-none font-bold text-sm text-gray-900 focus:border-black focus:ring-1 focus:ring-black" />
              <p className="text-xs text-gray-400 mt-1.5">Overrides the auto-computed label in the storefront if set.</p>
            </div>
            {formData.working_days.length > 0 && (
              <div className="mt-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${formData.opening_time && formData.closing_time ? 'bg-green-500' : 'bg-gray-300'}`} />
                <div>
                  <p className="font-black text-sm text-gray-900">{formData.working_days.join(' · ')}</p>
                  {formData.opening_time && formData.closing_time && (
                    <p className="text-xs text-gray-500 font-medium">{formData.delivery_hours || `${formData.opening_time} – ${formData.closing_time}`}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div className="flex flex-col h-full min-h-screen relative z-10">

      {/* ── STICKY HEADER ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 md:px-8 py-4 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tighter">Studio</h1>
              <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-widest shrink-0 ${isFood ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                {isFood ? <ChefHat size={12} /> : <Package size={12} />}
                {store?.store_type}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 font-semibold mt-0.5 hidden xs:block">Design your luxury shopping experience.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 w-full xs:w-auto">
          {store?.slug && (
            <a href={`/store/${store.slug}`} target="_blank" rel="noopener noreferrer"
              className="flex-1 xs:flex-none flex items-center justify-center gap-1.5 bg-white border border-gray-200 shadow-sm text-gray-900 px-4 py-2.5 rounded-full font-black tracking-widest text-xs uppercase hover:bg-gray-50 hover:-translate-y-0.5 transition-all">
              <ExternalLink size={13} /> Live View
            </a>
          )}
          <button onClick={handleSave} disabled={isLoading}
            className="flex-1 xs:flex-none flex items-center justify-center gap-2 bg-black text-white px-5 py-2.5 rounded-full font-black tracking-widest text-xs uppercase hover:bg-gray-900 hover:-translate-y-0.5 shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)] transition-all disabled:opacity-70 disabled:hover:translate-y-0">
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Publish
          </button>
        </div>
      </header>

      {/* ── HORIZONTAL TAB PILLS (mobile / tablet, hidden on lg) ─────────── */}
      <div className="lg:hidden flex items-center gap-2 px-4 md:px-8 py-3 bg-white/60 backdrop-blur-sm border-b border-gray-100 overflow-x-auto no-scrollbar">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap font-black text-xs tracking-wider uppercase transition-all shrink-0 ${activeTab === tab.key ? 'bg-gray-900 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900'}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── THREE-PANE CONTENT AREA ───────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT SIDEBAR (desktop only) */}
        <aside className="hidden lg:flex flex-col w-52 xl:w-56 shrink-0 border-r border-gray-100 bg-white/40 p-4 gap-2">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl font-black text-sm transition-all group ${activeTab === tab.key ? 'bg-white shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-gray-100 text-gray-900' : 'text-gray-500 hover:bg-white/50 hover:text-gray-900'}`}>
              <span className={activeTab === tab.key ? '' : 'group-hover:scale-110 transition-transform'}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </aside>

        {/* CENTER CONTENT (scrollable) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 xl:p-10">
          {renderTabContent()}
        </main>

        {/* RIGHT PHONE PREVIEW (md+ always visible) */}
        <aside className="hidden md:flex flex-col w-[300px] lg:w-[340px] xl:w-[380px] shrink-0 border-l border-gray-100 bg-white/20 backdrop-blur-sm p-4 lg:p-6 overflow-y-auto">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 text-center">Live Preview</p>
          <div className="sticky top-4">
            {renderPhonePreview()}
          </div>
        </aside>
      </div>

      {/* ── MOBILE PREVIEW BUTTON (visible only on < md) ─────────────────── */}
      <button
        onClick={() => setShowMobilePreview(true)}
        className="md:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-gray-900 text-white px-5 py-3.5 rounded-full font-black text-xs uppercase tracking-widest shadow-[0_8px_30px_rgba(0,0,0,0.25)] hover:bg-black transition-all"
      >
        <Eye size={16} /> Preview
      </button>

      {/* ── MOBILE PREVIEW SHEET ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showMobilePreview && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center p-4"
            onClick={() => setShowMobilePreview(false)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm bg-white rounded-[2.5rem] p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <p className="font-black text-gray-900">Store Preview</p>
                <button onClick={() => setShowMobilePreview(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                  <X size={16} />
                </button>
              </div>
              {renderPhonePreview()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
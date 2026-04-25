'use client'

import React, { useState, useEffect } from 'react'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Loader2, ShoppingBag, MapPin, Search, Heart, User, ArrowRight, X, Check, SlidersHorizontal, Plus, Star, Lock, Chrome, CheckCircle2, ArrowLeft, CheckCircle } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import ProfileDropdown from '@/components/ProfileDropdown'
import { useFavoriteStore } from '@/store/favoriteStore'

interface RetailCategory { id: string; name: string; slug: string }
interface RetailProduct { id: string; category: string; category_name: string; name: string; description: string; price: string; image: string | null; stock_quantity: number; options?: string | any[]; extras?: string | any[] }

export default function RetailStorefront({ store }: { store: any }) {
  const router = useRouter()
  
  // 🌟 UNIVERSAL AUTH & CART STATES
  const { data: session, isPending } = authClient.useSession()
  const { isAuthModalOpen, openAuthModal, closeAuthModal } = useAuthStore()
  const { carts, addItem, removeItem, mergeCartWithBackend } = useCartStore()
  const { favorites, fetchFavorites, toggleFavorite } = useFavoriteStore()
  
  const [isMounted, setIsMounted] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  // Grab the specific cart for this store safely to avoid hydration errors
  const cartItems = isMounted ? (carts[store.id] || []) : []

  const [categories, setCategories] = useState<RetailCategory[]>([])
  const [products, setProducts] = useState<RetailProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('ALL')
  
  // UI States
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Auth Modal States
  const [authPhone, setAuthPhone] = useState('')
  const [authOtp, setAuthOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50)
  })

  useEffect(() => {
    setIsMounted(true) 
  }, [])

  useEffect(() => {
    if (session) fetchFavorites()
  }, [session, fetchFavorites])

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get(`/retail/categories/?store_id=${store.id}`),
          api.get(`/retail/products/?store_id=${store.id}`)
        ])
        setCategories(catRes.data.results || catRes.data || [])
        setProducts(prodRes.data.results || prodRes.data || [])
      } catch (err) { 
        console.error(err) 
      } finally { 
        setIsLoading(false) 
      }
    }
    if (store?.id) fetchCatalog()
  }, [store.id])

  const safeProducts = Array.isArray(products) ? products : []
  const filteredProducts = safeProducts.filter(product => {
    return activeCategory === 'ALL' || product.category === activeCategory
  })

  // 🛒 Add to cart → navigate to cart page
  const handleAddToCart = (product: any) => {
    addItem(store.id, { ...product, quantity: 1 })
    setToastMessage(`Added ${product.name} to your cart.`)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // 🤝 THE SILENT MERGE HANDSHAKE
  const handleGoogleAuth = async () => {
    setAuthLoading(true)
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: window.location.href,
      })
    } catch (err: any) {
      setAuthError(err.message || "Google sign-in failed.")
      setAuthLoading(false)
    }
  }

  const handleSendOtp = async () => {
    setAuthError('')
    setAuthLoading(true)
    try {
      const { error: err } = await (authClient as any).phoneNumber.sendOtp({
        phoneNumber: authPhone,
      })
      if (err) throw new Error(err.message)
      setOtpSent(true)
    } catch (err: any) {
      setAuthError(err.message || 'Could not send OTP.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)
    try {
      const { error: err } = await (authClient as any).phoneNumber.verify({
        phoneNumber: authPhone,
        code: authOtp,
      })
      if (err) throw new Error(err.message)
      
      // MAGIC: Merge cart
      await mergeCartWithBackend(store.id, 'RETAIL')
      
      closeAuthModal()
      router.push(`/store/${store.slug}/cart`)
    } catch (err: any) {
      setAuthError(err.message || 'Invalid OTP.')
    } finally {
      setAuthLoading(false)
    }
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-gray-300" size={50} /></div>

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#ffffff');
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
  }
  // The clean, extracted logout function
  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            setIsUserMenuOpen(false)
            window.location.reload()
          }
        }
      })
    } catch (err) {
      console.error("Logout error:", err)
    }
  }
  const bgRgb = hexToRgb(store.background_color)
  const textRgb = hexToRgb(store.secondary_color)
  const announceRgb = hexToRgb(store.announcement_color || store.primary_color)
  const cartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0)

  // Working hours helpers
  const getHoursDisplay = () => {
    if (store.delivery_hours) return store.delivery_hours
    if (!store.opening_time || !store.closing_time) return null
    const fmt = (t: string) => { const [h, m] = t.split(':'); const hour = parseInt(h); return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}` }
    return `${fmt(store.opening_time)} – ${fmt(store.closing_time)}`
  }
  const hoursDisplay = getHoursDisplay()
  const daysDisplay = Array.isArray(store.working_days) && store.working_days.length > 0
    ? store.working_days.join(' · ')
    : typeof store.working_days === 'string' && store.working_days ? store.working_days : null

  return (
    <main className="min-h-screen pb-32 font-sans transition-colors duration-700 relative" style={{ backgroundColor: store.background_color || '#fafafa', color: store.secondary_color || '#111827' }}>
      
      {/* ── TOP ANNOUNCEMENT BAR (Floating Pill) ── */}
      {(store.announcement_is_active && store.announcement_text) && (
        <div className="absolute top-4 md:top-6 lg:top-8 inset-x-0 z-[150] px-4 md:px-6 lg:px-8 max-w-[1600px] mx-auto pointer-events-none">
          <div className="w-full py-2.5 px-4 text-xs font-black tracking-widest uppercase shadow-2xl rounded-2xl overflow-hidden whitespace-nowrap pointer-events-auto border" style={{ backgroundColor: store.announcement_color || store.primary_color, color: '#fff', borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="inline-block" style={{ animation: 'marquee 30s linear infinite', paddingLeft: '100%' }}>
              {Array(15).fill(store.announcement_text).map((text, i) => (
                <span key={i}>
                  {text} <span className="mx-6 opacity-50 text-[10px]">✦</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* TOAST NOTIFICATION */}
      <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ${toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'}`}>
        <div className="backdrop-blur-xl px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl border" style={{ backgroundColor: `rgba(${textRgb}, 0.9)`, color: store.background_color, borderColor: `rgba(${bgRgb}, 0.1)` }}>
          <Check size={16} />
          <span className="text-sm font-bold tracking-wide">{toastMessage}</span>
        </div>
      </div>

      {/* GLOBAL AUTH MODAL */}
      <div className={`fixed inset-0 z-[300] flex items-center justify-center transition-all duration-500 ${isAuthModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={closeAuthModal}></div>
        <div className="relative w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl border transition-transform duration-500 scale-100" style={{ backgroundColor: `rgba(${bgRgb}, 0.98)`, color: store.secondary_color, borderColor: `rgba(${textRgb}, 0.1)` }}>
          <button onClick={closeAuthModal} className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 transition-colors"><X size={20} /></button>
          
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-xl border" style={{ backgroundColor: store.primary_color, color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-3xl font-black tracking-tighter mb-2">Secure Checkout</h2>
            <p className="text-sm opacity-60 font-medium">Verify your identity to place your order.</p>
          </div>

          <div className="space-y-6">
            {/* Google Social */}
            <button 
              onClick={handleGoogleAuth}
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white border border-gray-200 shadow-sm font-bold text-gray-700 hover:bg-gray-50 transition-all font-sans"
            >
              <Chrome size={20} className="text-gray-900" />
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em] opacity-40"><span className="bg-transparent px-4">OR USE PHONE</span></div>
            </div>

            {authError && <div className="text-xs font-bold text-red-500 text-center bg-red-50 p-3 rounded-xl border border-red-100">{authError}</div>}

            {!otpSent ? (
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[12px] font-black opacity-40">+251</div>
                  <input 
                    type="tel" 
                    value={authPhone} 
                    onChange={e => setAuthPhone(e.target.value)}
                    placeholder="911 234 567"
                    className="w-full bg-black/5 border-none rounded-2xl py-4 pl-14 pr-4 outline-none font-bold text-base focus:ring-2 focus:ring-gray-900/20"
                    style={{ color: store.secondary_color }}
                  />
                </div>
                <button 
                  onClick={handleSendOtp}
                  disabled={authLoading || authPhone.length < 9}
                  className="w-full py-4 rounded-2xl font-black tracking-widest uppercase text-xs shadow-xl transition-all disabled:opacity-50"
                  style={{ backgroundColor: store.primary_color, color: '#fff' }}
                >
                  {authLoading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Send Verification Code'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                <input 
                  type="text" 
                  maxLength={6}
                  value={authOtp}
                  onChange={e => setAuthOtp(e.target.value)}
                  placeholder="······"
                  className="w-full bg-black/5 border-none rounded-2xl py-5 text-center font-black text-3xl tracking-[1rem] outline-none focus:ring-2 focus:ring-gray-900/20"
                  style={{ color: store.secondary_color }}
                />
                <button 
                  type="submit"
                  disabled={authLoading || authOtp.length < 6}
                  className="w-full py-4 rounded-2xl font-black tracking-widest uppercase text-xs shadow-xl transition-all disabled:opacity-50"
                  style={{ backgroundColor: store.primary_color, color: '#fff' }}
                >
                  {authLoading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Verify & Checkout'}
                </button>
                <button type="button" onClick={() => setOtpSent(false)} className="text-[10px] font-black tracking-widest uppercase opacity-40 hover:opacity-100 transition-opacity">Change phone number</button>
              </form>
            )}
          </div>
        </div>
      </div>


      {/* ── HERO ── */}
      <div className={`px-4 md:px-6 lg:px-8 pb-4 md:pb-6 lg:pb-8 max-w-[1600px] mx-auto ${(store.announcement_is_active && store.announcement_text) ? 'pt-[4.5rem] md:pt-[5.5rem] lg:pt-[6.5rem]' : 'pt-4 md:pt-6 lg:pt-8'}`}>
        <header
          className="relative w-full h-[45vh] md:h-[60vh] lg:h-[75vh] rounded-[2rem] md:rounded-[3rem] flex flex-col justify-between overflow-hidden shadow-2xl border"
          style={{ borderColor: `rgba(${textRgb}, 0.05)` }}
        >
          {store.banner_image
            ? <img src={store.banner_image} className="absolute inset-0 w-full h-full object-cover" alt="Banner" />
            : <div className="absolute inset-0 opacity-20" style={{ backgroundColor: store.primary_color }} />
          }
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/60" />

          {/* Top Actions Row (Inside Hero) */}
          <div className="relative z-20 flex items-center justify-between p-6 md:p-8 w-full animate-in fade-in slide-in-from-top-4 duration-700">
            <button onClick={() => router.push('/')} className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:scale-105 transition-all text-white shadow-lg">
              <ArrowLeft size={20} />
            </button>
            
            <div className="flex items-center gap-3">
              <button onClick={() => router.push(`/store/${store.slug}/cart`)} className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:scale-105 transition-all text-white shadow-lg relative">
                <ShoppingBag size={20} />
                {cartCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg animate-bounce" style={{ backgroundColor: store.primary_color }}>{cartCount}</span>}
              </button>
              
              <button onClick={() => router.push(`/store/${store.slug}/wishlist`)} className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:scale-105 transition-all text-white shadow-lg">
                <Heart size={20} />
              </button>
              
              <div className="relative">
                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:scale-105 transition-all text-white shadow-lg">
                  <User size={20} />
                </button>
                <ProfileDropdown isOpen={isUserMenuOpen} onClose={() => setIsUserMenuOpen(false)} onSignOut={handleSignOut} />
              </div>
            </div>
          </div>

          {/* Center Content (Name & Description) */}
          <div className="relative z-10 flex flex-col items-center text-center px-4 mt-auto">
            <h1
              className="text-5xl md:text-8xl lg:text-[7rem] font-black tracking-tighter text-white drop-shadow-2xl mb-4 leading-none max-w-5xl"
              style={{ fontFamily: `"${store.heading_font || 'Inter'}", sans-serif` }}
            >
              {store.name}
            </h1>
            
            {store.description && (
              <p className="max-w-2xl text-white/90 text-sm md:text-lg lg:text-xl font-medium leading-relaxed drop-shadow-lg px-4 mb-6 md:mb-8">
                {store.description}
              </p>
            )}
            
            {daysDisplay && (
              <p className="mb-4 text-white/70 text-[10px] md:text-xs font-black uppercase tracking-widest">{daysDisplay}</p>
            )}
            
            {/* Status & Info Pill beautifully placed */}
            <div className="flex items-center gap-4 backdrop-blur-2xl bg-black/40 px-6 py-3.5 rounded-full border border-white/10 text-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] flex-wrap justify-center mb-8 md:mb-12 translate-y-2">
              <span className={`flex items-center gap-2 text-xs md:text-sm font-black uppercase tracking-wider ${store.is_open ? 'text-[#34d399]' : 'text-[#f87171]'}`}>
                <span className={`w-2 h-2 rounded-full ${store.is_open ? 'bg-[#34d399] animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'bg-[#f87171]'}`} />
                {store.is_open ? 'Open Now' : 'Closed'}
              </span>
              {store.city && <><span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-white/30" /><span className="flex items-center gap-1.5 text-sm font-bold"><MapPin size={14} className="opacity-80" /> {store.city}</span></>}
              {hoursDisplay && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/30 hidden md:block" />
                  <span className="hidden md:flex items-center gap-1.5 text-sm font-bold opacity-80">{hoursDisplay}</span>
                </>
              )}
            </div>
            
            <button onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })} className="px-8 py-3.5 rounded-full font-black tracking-widest uppercase text-xs flex items-center gap-2 hover:scale-105 transition-all shadow-2xl backdrop-blur-md mb-8" style={{ backgroundColor: store.primary_color, color: '#fff' }}>
              Shop Collection <ArrowRight size={16} />
            </button> 
          </div>
        </header>
      </div>

      {/* MAIN LAYOUT (SIDEBAR + GRID) */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-8 flex flex-col lg:flex-row gap-10">
        
        {/* SIDEBAR (Desktop) */}
        <aside className="w-full lg:w-60 shrink-0">
          {/* 📱 MOBILE CATEGORIES (Horizontal Scroll) */}
          <div className="lg:hidden -mx-4 px-4 overflow-x-auto no-scrollbar flex items-center gap-3 mb-8">
            <button 
              onClick={() => setActiveCategory('ALL')} 
              className={`whitespace-nowrap px-6 py-3 rounded-2xl font-black text-xs tracking-widest uppercase transition-all border ${activeCategory === 'ALL' ? 'shadow-lg scale-105' : 'opacity-60 border-transparent hover:opacity-100'}`}
              style={{ backgroundColor: activeCategory === 'ALL' ? store.primary_color : 'transparent', color: activeCategory === 'ALL' ? '#fff' : 'inherit', borderColor: activeCategory === 'ALL' ? store.primary_color : 'none' }}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button 
                key={cat.id} 
                onClick={() => setActiveCategory(cat.id)} 
                className={`whitespace-nowrap px-6 py-3 rounded-2xl font-black text-xs tracking-widest uppercase transition-all border ${activeCategory === cat.id ? 'shadow-lg scale-105' : 'opacity-60 border-transparent hover:opacity-100'}`}
                style={{ backgroundColor: activeCategory === cat.id ? store.primary_color : 'transparent', color: activeCategory === cat.id ? '#fff' : 'inherit', borderColor: activeCategory === cat.id ? store.primary_color : 'none' }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="sticky top-40 space-y-10 hidden lg:block">
            <div>
              <h3 className="text-base font-black flex items-center gap-2 mb-6 tracking-tight"><SlidersHorizontal size={18}/> Filters</h3>
              <div className="space-y-3">
                <h4 className="font-bold text-xs tracking-widest uppercase opacity-60">Categories</h4>
                <div onClick={() => setActiveCategory('ALL')} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-3.5 h-3.5 rounded-full border transition-colors`} style={{ backgroundColor: activeCategory==='ALL' ? store.primary_color : 'transparent', borderColor: activeCategory==='ALL' ? store.primary_color : `rgba(${textRgb}, 0.3)` }}></div>
                  <span className={`text-sm font-medium ${activeCategory==='ALL' ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>All Products</span>
                </div>
                {categories.map((cat) => (
                  <div key={cat.id} onClick={() => setActiveCategory(cat.id)} className="flex items-center gap-3 cursor-pointer group mt-3">
                    <div className={`w-3.5 h-3.5 rounded-full border transition-colors`} style={{ backgroundColor: activeCategory===cat.id ? store.primary_color : 'transparent', borderColor: activeCategory===cat.id ? store.primary_color : `rgba(${textRgb}, 0.3)` }}></div>
                    <span className={`text-sm font-medium ${activeCategory===cat.id ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* COMPACT PRODUCT GRID */}
        <section className="flex-1">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight" style={{ fontFamily: `"${store.heading_font || 'Inter'}", sans-serif` }}>Curated Pieces</h2>
            <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full border shadow-sm" style={{ borderColor: `rgba(${textRgb}, 0.2)` }}>{filteredProducts.length} Items</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-40 rounded-[3rem] border-2 border-dashed" style={{ borderColor: `rgba(${textRgb}, 0.1)` }}>
              <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-xl font-black tracking-tight opacity-50">Collection Empty</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
              {filteredProducts.map(p => {
                let hasConfig = false;
                try {
                  const opts = typeof p.options === 'string' ? JSON.parse(p.options) : (p.options || [])
                  const exts = typeof p.extras === 'string' ? JSON.parse(p.extras) : (p.extras || [])
                  if (opts.length > 0 || exts.length > 0) hasConfig = true
                } catch(e){}
                return (
                <div key={p.id} onClick={() => router.push(`/store/${store.slug}/product/${p.id}`)} className="group cursor-pointer flex flex-col rounded-2xl p-2 border shadow-sm hover:shadow-xl transition-all duration-500 bg-white/5 backdrop-blur-sm hover:-translate-y-1.5" style={{ borderColor: `rgba(${textRgb}, 0.05)` }}>
                  
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-black/5 mb-3 shadow-inner">
                    {p.image ? (
                      <img src={p.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={p.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-10"><ShoppingBag size={30}/></div>
                    )}

                    <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                      {p.category_name && (
                        <div className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md backdrop-blur-md shadow-sm" style={{ backgroundColor: `rgba(${bgRgb}, 0.9)`, color: store.secondary_color }}>
                          {p.category_name}
                        </div>
                      )}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!session) return openAuthModal();
                          toggleFavorite(p, 'RETAIL');
                        }}
                        className="w-7 h-7 rounded-full backdrop-blur-md flex items-center justify-center hover:scale-110 transition-transform shadow-sm" 
                        style={{ backgroundColor: `rgba(${bgRgb}, 0.9)`, color: favorites.some(f => f.productId === p.id && f.type === 'RETAIL') ? '#ef4444' : store.secondary_color }}
                      >
                        <Heart size={12} fill={favorites.some(f => f.productId === p.id && f.type === 'RETAIL') ? 'currentColor' : 'none'} />
                      </button>
                    </div>


                  </div>

                  <div className="px-1 flex flex-col flex-1">
                    <h3 className="text-sm font-black tracking-tight mb-0.5 line-clamp-1">{p.name}</h3>
                    <p className="text-[11px] opacity-60 line-clamp-1 mb-3 font-medium">{p.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <p className="text-base font-black tracking-tighter" style={{ color: store.primary_color }}>Br {parseFloat(p.price).toFixed(2)}</p>
                      <div className="flex items-center gap-1 opacity-50"><span className="text-[10px] font-bold">4.9</span><Star size={10} className="fill-current text-current"/></div>
                    </div>
                  </div>

                </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

    </main>
  )
}
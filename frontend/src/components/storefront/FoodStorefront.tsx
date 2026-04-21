'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import {
  Loader2, ShoppingBag, Search, Heart, User, X, Check,
  Star, Clock, Bike, Flame, Leaf, ArrowLeft, ArrowRight,
  CheckCircle2, Chrome, Lock
} from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import ProfileDropdown from '@/components/ProfileDropdown'
import { useFavoriteStore } from '@/store/favoriteStore'

interface MenuCategory { id: string; name: string; order: number }
interface MenuItem {
  id: string; category: string; category_name: string; name: string;
  description: string; price: string; image: string | null;
  preparation_time_minutes: number; is_vegetarian: boolean; is_vegan: boolean; is_spicy: boolean;
  options?: any; extras?: any
}

export default function FoodStorefront({ store }: { store: any }) {
  const router = useRouter()

  const { data: session } = authClient.useSession()
  const { isAuthModalOpen, openAuthModal, closeAuthModal } = useAuthStore()
  const { carts } = useCartStore()
  const { favorites, fetchFavorites, toggleFavorite } = useFavoriteStore()

  const [isMounted, setIsMounted] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)

  // Auth modal states
  const [authPhone, setAuthPhone] = useState('')
  const [authOtp, setAuthOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const { scrollY } = useScroll()
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useMotionValueEvent(scrollY, 'change', (latest) => setIsScrolled(latest > 50))

  useEffect(() => { setIsMounted(true) }, [])
  useEffect(() => { if (session) fetchFavorites() }, [session, fetchFavorites])

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const [catRes, itemRes] = await Promise.all([
          api.get(`/food/categories/?store_id=${store.id}`),
          api.get(`/food/items/?store_id=${store.id}`)
        ])
        setCategories(catRes.data.results || catRes.data || [])
        setItems(itemRes.data.results || itemRes.data || [])
      } catch (err) { console.error(err) }
      finally { setIsLoading(false) }
    }
    if (store?.id) fetchMenu()
  }, [store.id])

  const hexToRgb = (hex: string) => {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#ffffff')
    return r ? `${parseInt(r[1], 16)}, ${parseInt(r[2], 16)}, ${parseInt(r[3], 16)}` : '255,255,255'
  }

  const bgRgb = hexToRgb(store.background_color)
  const textRgb = hexToRgb(store.secondary_color)

  const cartItems = isMounted ? (carts[store.id] || []) : []
  const cartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0)

  const safeItems = Array.isArray(items) ? items : []
  const filteredItems = safeItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  // Group items by category
  const categoriesWithItems = categories
    .map(cat => ({
      ...cat,
      items: filteredItems.filter(item => item.category === cat.id)
    }))
    .filter(cat => cat.items.length > 0)

  const uncategorized = filteredItems.filter(item => !item.category || !categories.find(c => c.id === item.category))

  const scrollToCategory = (catId: string) => {
    setActiveCategory(catId)
    const el = categoryRefs.current[catId]
    if (el) {
      const offset = 160
      const top = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  const handleSignOut = async () => {
    await authClient.signOut({ fetchOptions: { onSuccess: () => { setIsUserMenuOpen(false); window.location.reload() } } })
  }

  const handleGoogleAuth = async () => {
    setAuthLoading(true)
    try {
      await authClient.signIn.social({ provider: 'google', callbackURL: window.location.href })
    } catch (err: any) {
      setAuthError(err.message || 'Google sign-in failed.')
      setAuthLoading(false)
    }
  }

  const handleSendOtp = async () => {
    setAuthError(''); setAuthLoading(true)
    try {
      const { error: err } = await (authClient as any).phoneNumber.sendOtp({ phoneNumber: authPhone })
      if (err) throw new Error(err.message)
      setOtpSent(true)
    } catch (err: any) {
      setAuthError(err.message || 'Could not send OTP.')
    } finally { setAuthLoading(false) }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthError(''); setAuthLoading(true)
    try {
      const { error: err } = await (authClient as any).phoneNumber.verify({ phoneNumber: authPhone, code: authOtp })
      if (err) throw new Error(err.message)
      closeAuthModal()
    } catch (err: any) {
      setAuthError(err.message || 'Invalid OTP.')
    } finally { setAuthLoading(false) }
  }

  // Working hours display
  const getHoursDisplay = () => {
    if (!store.delivery_hours && (!store.opening_time || !store.closing_time)) return null
    if (store.delivery_hours) return store.delivery_hours
    const fmt = (t: string) => {
      const [h, m] = t.split(':')
      const hour = parseInt(h)
      return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
    }
    return `${fmt(store.opening_time)} – ${fmt(store.closing_time)}`
  }

  const hoursDisplay = getHoursDisplay()
  const daysDisplay = Array.isArray(store.working_days) && store.working_days.length > 0
    ? store.working_days.join(' · ')
    : typeof store.working_days === 'string' && store.working_days
    ? store.working_days
    : null

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-gray-300" size={50} /></div>

  return (
    <main
      className="min-h-screen pb-32 font-sans transition-colors duration-700 relative"
      style={{ backgroundColor: store.background_color || '#fafafa', color: store.secondary_color || '#111827' }}
    >
      {/* ── NAVBAR ── */}
      <div
        className={`fixed top-0 inset-x-0 z-[150] px-4 py-3 md:py-4 transition-all duration-500 ${isScrolled ? 'backdrop-blur-2xl shadow-xl' : ''}`}
        style={{ backgroundColor: isScrolled ? `rgba(${bgRgb}, 0.85)` : 'transparent', borderBottom: isScrolled ? `1px solid rgba(${textRgb}, 0.05)` : 'none' }}
      >
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:scale-105 transition-transform">
              <ArrowLeft size={20} />
            </button>
            <div className="hidden sm:flex flex-col">
              <span className="text-lg font-black tracking-tighter leading-none">{store.name}</span>
              <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest mt-0.5">Ethiopia</span>
            </div>
          </div>

          {/* Center search */}
          <div className="hidden lg:flex flex-1 max-w-xl relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity" size={18} />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 outline-none font-bold text-sm focus:bg-white/10 transition-all"
            />
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Cart */}
            <button
              onClick={() => router.push(`/store/${store.slug}/cart`)}
              className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:scale-110 transition-transform relative"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg animate-bounce" style={{ backgroundColor: store.primary_color }}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* Wishlist */}
            <button
              onClick={() => router.push(`/store/${store.slug}/wishlist`)}
              className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:scale-110 transition-transform"
            >
              <Heart size={20} />
            </button>

            {/* Profile */}
            <div className="relative">
              <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:scale-110 transition-transform">
                <User size={20} />
              </button>
              <ProfileDropdown isOpen={isUserMenuOpen} onClose={() => setIsUserMenuOpen(false)} onSignOut={handleSignOut} />
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden mt-3 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={16} />
          <input
            type="text"
            placeholder="Search our menu..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-black/5 rounded-[1.25rem] py-3 pl-11 pr-4 outline-none font-bold text-xs"
          />
        </div>
      </div>

      {/* TOAST */}
      <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ${toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'}`}>
        <div className="backdrop-blur-xl px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl border" style={{ backgroundColor: `rgba(${textRgb}, 0.9)`, color: store.background_color, borderColor: `rgba(${bgRgb}, 0.1)` }}>
          <Check size={16} />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      </div>

      {/* AUTH MODAL */}
      <div className={`fixed inset-0 z-[300] flex items-center justify-center transition-all duration-500 ${isAuthModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={closeAuthModal} />
        <div className="relative w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl border" style={{ backgroundColor: `rgba(${bgRgb}, 0.98)`, borderColor: `rgba(${textRgb}, 0.1)` }}>
          <button onClick={closeAuthModal} className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5"><X size={20} /></button>
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-xl" style={{ backgroundColor: store.primary_color, color: '#fff' }}>
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-3xl font-black tracking-tighter mb-2">Sign in</h2>
            <p className="text-sm opacity-60 font-medium">Sign in to save favourites and checkout.</p>
          </div>
          <div className="space-y-5">
            <button onClick={handleGoogleAuth} disabled={authLoading} className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white border border-gray-200 shadow-sm font-bold text-gray-700 hover:bg-gray-50 transition-all">
              <Chrome size={20} className="text-orange-500" /> Continue with Google
            </button>
            <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div><div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em] opacity-40"><span className="bg-transparent px-4">OR USE PHONE</span></div></div>
            {authError && <div className="text-xs font-bold text-red-500 text-center bg-red-50 p-3 rounded-xl">{authError}</div>}
            {!otpSent ? (
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[12px] font-black opacity-40">+251</div>
                  <input type="tel" value={authPhone} onChange={e => setAuthPhone(e.target.value)} placeholder="911 234 567" className="w-full bg-black/5 rounded-2xl py-4 pl-14 pr-4 outline-none font-bold text-base" style={{ color: store.secondary_color }} />
                </div>
                <button onClick={handleSendOtp} disabled={authLoading || authPhone.length < 9} className="w-full py-4 rounded-2xl font-black tracking-widest uppercase text-xs shadow-xl disabled:opacity-50" style={{ backgroundColor: store.primary_color, color: '#fff' }}>
                  {authLoading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Send Verification Code'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                <input type="text" maxLength={6} value={authOtp} onChange={e => setAuthOtp(e.target.value)} placeholder="······" className="w-full bg-black/5 rounded-2xl py-5 text-center font-black text-3xl tracking-[1rem] outline-none" style={{ color: store.secondary_color }} />
                <button type="submit" disabled={authLoading || authOtp.length < 6} className="w-full py-4 rounded-2xl font-black tracking-widest uppercase text-xs shadow-xl disabled:opacity-50" style={{ backgroundColor: store.primary_color, color: '#fff' }}>
                  {authLoading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Verify & Continue'}
                </button>
                <button type="button" onClick={() => setOtpSent(false)} className="text-[10px] font-black tracking-widest uppercase opacity-40 hover:opacity-100">Change phone number</button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── HERO ── */}
      <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
        <header
          className="relative w-full h-[45vh] md:h-[55vh] rounded-[2rem] md:rounded-[3rem] flex flex-col items-center justify-center overflow-hidden shadow-xl border"
          style={{ borderColor: `rgba(${textRgb}, 0.05)` }}
        >
          {store.banner_image
            ? <img src={store.banner_image} className="absolute inset-0 w-full h-full object-cover" alt="Banner" />
            : <div className="absolute inset-0 opacity-20" style={{ backgroundColor: store.primary_color }} />
          }
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />

          <div className="relative z-10 flex flex-col items-center text-center px-4 mt-8">
            {/* Status & Info Pill */}
            <div className="flex items-center gap-3 mb-5 backdrop-blur-md bg-white/10 px-5 py-2.5 rounded-full border border-white/20 text-white shadow-lg flex-wrap justify-center">
              {/* Open/Closed badge */}
              <span className={`flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full ${store.is_open ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${store.is_open ? 'bg-green-400' : 'bg-red-400'}`} />
                {store.is_open ? 'Open Now' : 'Closed'}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span className="flex items-center gap-1 text-sm font-bold"><Star size={13} className="fill-yellow-400 text-yellow-400" /> 4.8</span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span className="flex items-center gap-1.5 text-sm font-bold"><Clock size={13} className="text-orange-400" /> 15–25 min</span>
              {hoursDisplay && (
                <>
                  <span className="w-1 h-1 rounded-full bg-white/30 hidden md:block" />
                  <span className="hidden md:flex items-center gap-1.5 text-sm font-bold opacity-80">{hoursDisplay}</span>
                </>
              )}
            </div>

            <h1
              className="text-5xl md:text-8xl font-black tracking-tighter text-white drop-shadow-xl mb-3 leading-none max-w-5xl"
              style={{ fontFamily: `"${store.heading_font || 'Inter'}", sans-serif` }}
            >
              {store.name}
            </h1>

            {store.description && (
              <p className="max-w-2xl text-white/80 text-base md:text-lg font-medium leading-relaxed drop-shadow-md px-4">{store.description}</p>
            )}

            {daysDisplay && (
              <p className="mt-3 text-white/60 text-xs font-bold uppercase tracking-widest">{daysDisplay}</p>
            )}
          </div>
        </header>
      </div>

      {/* ── CATEGORY CHIPS (Live Menu Chips) ── */}
      {categories.length > 0 && (
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 mb-6">
          <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-2">
            <button
              onClick={() => { setActiveCategory('ALL'); window.scrollTo({ top: 500, behavior: 'smooth' }) }}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full font-black text-xs tracking-widest uppercase transition-all border flex-shrink-0 ${activeCategory === 'ALL' ? 'shadow-lg scale-105' : 'opacity-60 border-transparent hover:opacity-100'}`}
              style={{
                backgroundColor: activeCategory === 'ALL' ? store.primary_color : 'transparent',
                color: activeCategory === 'ALL' ? '#fff' : 'inherit',
                borderColor: activeCategory === 'ALL' ? store.primary_color : `rgba(${textRgb}, 0.15)`
              }}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full font-black text-xs tracking-widest uppercase transition-all border flex-shrink-0 ${activeCategory === cat.id ? 'shadow-lg scale-105' : 'opacity-60 border-transparent hover:opacity-100'}`}
                style={{
                  backgroundColor: activeCategory === cat.id ? store.primary_color : 'transparent',
                  color: activeCategory === cat.id ? '#fff' : 'inherit',
                  borderColor: activeCategory === cat.id ? store.primary_color : `rgba(${textRgb}, 0.15)`
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── MENU: Category-as-Menu Horizontal Scroll per Section ── */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 space-y-12">
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 rounded-[3rem] border-2 border-dashed" style={{ borderColor: `rgba(${textRgb}, 0.1)` }}>
            <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-xl font-black tracking-tight opacity-50">No items found</p>
          </div>
        ) : (
          <>
            {/* Categorized items: horizontal scroll per category */}
            {categoriesWithItems.map(cat => (
              <div key={cat.id} ref={el => { categoryRefs.current[cat.id] = el }}>
                {/* Category heading */}
                <div className="flex items-center gap-4 mb-5">
                  <h2 className="text-xl md:text-2xl font-black tracking-tight" style={{ fontFamily: `"${store.heading_font || 'Inter'}", sans-serif` }}>
                    {cat.name}
                  </h2>
                  <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border" style={{ borderColor: `rgba(${textRgb}, 0.15)` }}>
                    {cat.items.length}
                  </span>
                  <div className="flex-1 h-px" style={{ backgroundColor: `rgba(${textRgb}, 0.06)` }} />
                </div>

                {/* Horizontal scroll row */}
                <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
                  {cat.items.map(item => (
                    <FoodCard key={item.id} item={item} store={store} bgRgb={bgRgb} textRgb={textRgb} session={session} favorites={favorites} toggleFavorite={toggleFavorite} openAuthModal={openAuthModal} router={router} />
                  ))}
                </div>
              </div>
            ))}

            {/* Uncategorized items (fallback) */}
            {uncategorized.length > 0 && (
              <div>
                <div className="flex items-center gap-4 mb-5">
                  <h2 className="text-xl md:text-2xl font-black tracking-tight">More Items</h2>
                  <div className="flex-1 h-px" style={{ backgroundColor: `rgba(${textRgb}, 0.06)` }} />
                </div>
                <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
                  {uncategorized.map(item => (
                    <FoodCard key={item.id} item={item} store={store} bgRgb={bgRgb} textRgb={textRgb} session={session} favorites={favorites} toggleFavorite={toggleFavorite} openAuthModal={openAuthModal} router={router} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `.hide-scrollbar::-webkit-scrollbar{display:none}.hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}` }} />
    </main>
  )
}

// ── FOOD PRODUCT CARD (Simplified: price + heart, click → detail page) ──
function FoodCard({ item, store, bgRgb, textRgb, session, favorites, toggleFavorite, openAuthModal, router }: any) {
  const isFav = favorites.some((f: any) => f.productId === item.id && f.type === 'FOOD')

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      onClick={() => router.push(`/store/${store.slug}/product/${item.id}`)}
      className="group cursor-pointer flex-shrink-0 w-44 md:w-52 flex flex-col rounded-2xl border shadow-sm hover:shadow-xl transition-shadow duration-300"
      style={{ borderColor: `rgba(${textRgb}, 0.07)`, backgroundColor: `rgba(${textRgb}, 0.02)` }}
    >
      {/* Image */}
      <div className="relative w-full aspect-square overflow-hidden rounded-t-2xl bg-black/5 shadow-inner">
        {item.image
          ? <img src={item.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={item.name} />
          : <div className="w-full h-full flex items-center justify-center opacity-10"><ShoppingBag size={28} /></div>
        }

        {/* Prep time chip */}
        {item.preparation_time_minutes > 0 && (
          <div className="absolute top-2 left-2 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg backdrop-blur-md shadow-sm" style={{ backgroundColor: `rgba(${bgRgb}, 0.9)`, color: store.secondary_color }}>
            <Clock size={9} /> {item.preparation_time_minutes}m
          </div>
        )}

        {/* Heart button */}
        <button
          onClick={e => {
            e.stopPropagation()
            if (!session) return openAuthModal()
            toggleFavorite(item, 'FOOD')
          }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full backdrop-blur-md flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
          style={{ backgroundColor: `rgba(${bgRgb}, 0.9)`, color: isFav ? '#ef4444' : store.secondary_color }}
        >
          <Heart size={12} fill={isFav ? 'currentColor' : 'none'} />
        </button>

        {/* Diet tags */}
        <div className="absolute bottom-2 left-2 flex gap-1">
          {item.is_vegan && <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center shadow-md"><Leaf size={10} /></div>}
          {item.is_spicy && <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md"><Flame size={10} /></div>}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-black text-sm tracking-tight line-clamp-2 leading-tight mb-2">{item.name}</h3>
        <div className="flex items-center justify-between mt-auto">
          <p className="text-base font-black tracking-tighter" style={{ color: store.primary_color }}>
            Br {parseFloat(item.price).toFixed(2)}
          </p>
          <ArrowRight size={14} className="opacity-30 group-hover:opacity-70 transition-opacity" />
        </div>
      </div>
    </motion.div>
  )
}
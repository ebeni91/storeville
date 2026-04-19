'use client'

import React, { useState, useEffect } from 'react'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Loader2, ShoppingBag, MapPin, Search, Heart, User, ArrowRight, X, Check, Menu, Star, Clock, Bike, Lock, Flame, Leaf, Plus, LogOut, Chrome, CheckCircle2, ArrowLeft } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import ProfileDropdown from '@/components/ProfileDropdown'
import { useFavoriteStore } from '@/store/favoriteStore'
import FavoriteDropdown from '@/components/FavoriteDropdown'

interface MenuCategory { id: string; name: string; order: number }
interface MenuItem { id: string; category: string; category_name: string; name: string; description: string; price: string; image: string | null; preparation_time_minutes: number; is_vegetarian: boolean; is_vegan: boolean; is_spicy: boolean; options?: string | any[]; extras?: string | any[] }

export default function FoodStorefront({ store }: { store: any }) {
  const router = useRouter()
  
  // 🌟 UNIVERSAL AUTH & CART STATES
  const { data: session, isPending } = authClient.useSession()
  const { isAuthModalOpen, openAuthModal, closeAuthModal } = useAuthStore()
  const { carts, addItem, removeItem, mergeCartWithBackend } = useCartStore()
  const { favorites, fetchFavorites, toggleFavorite } = useFavoriteStore()

  const [isMounted, setIsMounted] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isFavOpen, setIsFavOpen] = useState(false)

  // Grab the specific cart for this store safely to avoid hydration errors
  const cartItems = isMounted ? (carts[store.id] || []) : []

  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  
  // UI States
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Auth Modal States
  const [authPhone, setAuthPhone] = useState('')
  const [authOtp, setAuthOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [isCheckoutIntent, setIsCheckoutIntent] = useState(false)
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
    const fetchMenu = async () => {
      try {
        const [catRes, itemRes] = await Promise.all([
          api.get(`/food/categories/?store_id=${store.id}`),
          api.get(`/food/items/?store_id=${store.id}`)
        ])
        setCategories(catRes.data.results || catRes.data || [])
        setItems(itemRes.data.results || itemRes.data || [])
      } catch (err) { 
        console.error(err) 
      } finally { 
        setIsLoading(false) 
      }
    }
    if (store?.id) fetchMenu()
  }, [store.id])

  const safeItems = Array.isArray(items) ? items : []
  const filteredItems = safeItems.filter(item => {
    const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // 🛒 USING ZUSTAND CART
  const handleAddToCart = (item: any) => {
    addItem(store.id, { ...item, quantity: 1 })
    setToastMessage(`Added ${item.name} to order.`)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const removeFromCart = (itemId: string) => removeItem(store.id, itemId)

  // 🛡️ THE CHECKOUT INTERCEPTOR
  const handleProceedToCheckout = async () => {
    setIsCheckoutIntent(true)
    if (session) {
      try {
        if (cartItems.length > 0) {
          await mergeCartWithBackend(store.id, 'FOOD')
        }
      } catch (err) {
        console.error("Cart sync failed before checkout", err)
      }
      router.push(`/store/${store.slug}/checkout`)
    }
    else openAuthModal()
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
      await mergeCartWithBackend(store.id, 'FOOD')
      
      closeAuthModal()
      if (isCheckoutIntent) {
        router.push(`/store/${store.slug}/checkout`)
        setIsCheckoutIntent(false)
      }
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
  const cartTotal = cartItems.reduce((acc, curr) => acc + (parseFloat(curr.price) * curr.quantity), 0).toFixed(2)
  const cartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0)

  return (
    <main className="min-h-screen pb-32 font-sans transition-colors duration-700 relative" style={{ backgroundColor: store.background_color || '#fafafa', color: store.secondary_color || '#111827' }}>
      
      {/* 🧭 UNIVERSAL STORE NAV (Mobile & Desktop) */}
      <div className={`fixed top-0 inset-x-0 z-[150] px-4 py-3 md:py-6 transition-all duration-500 ${isScrolled ? 'backdrop-blur-2xl shadow-xl' : ''}`} style={{ backgroundColor: isScrolled ? `rgba(${bgRgb}, 0.8)` : 'transparent', borderBottom: isScrolled ? `1px solid rgba(${textRgb}, 0.05)` : 'none' }}>
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
           {/* Left: Store Branding */}
           <div className="flex items-center gap-3">
             <button onClick={() => router.push('/')} className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:scale-105 transition-transform"><ArrowLeft size={20} /></button>
             <div className="hidden sm:flex flex-col">
               <span className="text-lg font-black tracking-tighter leading-none">{store.name}</span>
               <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest mt-1">Ethiopia</span>
             </div>
           </div>

           {/* Center: Search (Desktop Only) */}
           <div className="hidden lg:flex flex-1 max-w-xl relative group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity" size={18} />
             <input 
               type="text" 
               placeholder="Search menu..."
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 outline-none font-bold text-sm focus:bg-white/10 transition-all focus:ring-4 focus:ring-white/5"
             />
           </div>

           {/* Right: Actions */}
           <div className="flex items-center gap-2 md:gap-4">
             <div className="relative">
               <button onClick={() => setIsCartOpen(true)} className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:scale-110 transition-transform relative">
                 <ShoppingBag size={20} />
                 {cartCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg animate-bounce" style={{ backgroundColor: store.primary_color }}>{cartCount}</span>}
               </button>
             </div>
             
             <div className="relative hidden md:block">
               <button onClick={() => setIsFavOpen(!isFavOpen)} className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:scale-110 transition-transform">
                 <Heart size={20} />
               </button>
               <FavoriteDropdown isOpen={isFavOpen} onClose={() => setIsFavOpen(false)} bgRgb={bgRgb} textRgb={textRgb} />
             </div>

             <div className="relative">
               <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:scale-110 transition-transform">
                 <User size={20} />
               </button>
               <ProfileDropdown isOpen={isUserMenuOpen} onClose={() => setIsUserMenuOpen(false)} onSignOut={handleSignOut} />
             </div>
           </div>
        </div>

        {/* 🔍 Mobile Search Field */}
        <div className="lg:hidden mt-3 relative group">
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
              <Chrome size={20} className="text-orange-500" />
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
                    className="w-full bg-black/5 border-none rounded-2xl py-4 pl-14 pr-4 outline-none font-bold text-base focus:ring-2 focus:ring-orange-500/20"
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
                  className="w-full bg-black/5 border-none rounded-2xl py-5 text-center font-black text-3xl tracking-[1rem] outline-none focus:ring-2 focus:ring-orange-500/20"
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


      {/* HERO SECTION (Restaurant Format) */}
      <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
        <header className="relative w-full h-[40vh] md:h-[50vh] rounded-[2rem] md:rounded-[3rem] flex flex-col items-center justify-center overflow-hidden shadow-xl border" style={{ borderColor: `rgba(${textRgb}, 0.05)` }}>
          {store.banner_image ? (
             <img src={store.banner_image} className="absolute inset-0 w-full h-full object-cover" alt="Banner" />
          ) : (
             <div className="absolute inset-0 opacity-20" style={{ backgroundColor: store.primary_color }}></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40"></div>

          <div className="relative z-10 flex flex-col items-center text-center px-4 mt-8">
            <div className="flex items-center gap-3 mb-6 backdrop-blur-md bg-white/10 px-5 py-2.5 rounded-full border border-white/20 text-white shadow-lg">
              <span className="flex items-center gap-1 text-sm font-bold"><Star size={14} className="fill-yellow-400 text-yellow-400" /> 4.8 Rating</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
              <span className="flex items-center gap-1.5 text-sm font-bold"><Clock size={14} className="text-orange-400" /> 15-25 min</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/50 hidden md:block"></span>
              <span className="hidden md:flex items-center gap-1.5 text-sm font-bold"><Bike size={14} className="text-white/80" /> Fast Delivery</span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white drop-shadow-xl mb-4 leading-none max-w-5xl" style={{ fontFamily: `"${store.heading_font || 'Inter'}", sans-serif` }}>
              {store.name}
            </h1>
            
            {store.description && (
              <p className="max-w-2xl text-white/90 text-base md:text-lg font-medium leading-relaxed drop-shadow-md px-4">{store.description}</p>
            )}
          </div>
        </header>
      </div>

      {/* FOOD MENU GRID */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-4">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight" style={{ fontFamily: `"${store.heading_font || 'Inter'}", sans-serif` }}>Menu Items</h2>
            <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full border shadow-sm" style={{ borderColor: `rgba(${textRgb}, 0.2)` }}>{filteredItems.length} Dishes</span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-20 rounded-[3rem] border-2 border-dashed" style={{ borderColor: `rgba(${textRgb}, 0.1)` }}>
              <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-xl font-black tracking-tight opacity-50">Menu Empty</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {filteredItems.map(item => {
                let hasConfig = false;
                try {
                  const opts = typeof item.options === 'string' ? JSON.parse(item.options) : (item.options || [])
                  const exts = typeof item.extras === 'string' ? JSON.parse(item.extras) : (item.extras || [])
                  if (opts.length > 0 || exts.length > 0) hasConfig = true
                } catch(e){}
                return (
                <div key={item.id} onClick={() => router.push(`/store/${store.slug}/product/${item.id}`)} className="group cursor-pointer flex flex-col rounded-2xl p-2 border shadow-sm hover:shadow-xl transition-all duration-500 bg-white/5 backdrop-blur-sm hover:-translate-y-1.5" style={{ borderColor: `rgba(${textRgb}, 0.05)` }}>
                  
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-black/5 mb-3 shadow-inner">
                    {item.image ? (
                      <img src={item.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={item.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-10"><ShoppingBag size={30}/></div>
                    )}

                    <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                      <div className="flex gap-1.5">
                        {item.category_name && (
                          <div className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md backdrop-blur-md shadow-sm" style={{ backgroundColor: `rgba(${bgRgb}, 0.9)`, color: store.secondary_color }}>
                            {item.category_name}
                          </div>
                        )}
                        {item.preparation_time_minutes > 0 && (
                          <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md backdrop-blur-md shadow-sm" style={{ backgroundColor: `rgba(${bgRgb}, 0.9)`, color: store.secondary_color }}>
                            <Clock size={10} /> {item.preparation_time_minutes}m
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!session) return openAuthModal();
                            toggleFavorite(item, 'FOOD');
                          }}
                          className="w-7 h-7 rounded-full backdrop-blur-md flex items-center justify-center hover:scale-110 transition-transform shadow-sm" 
                          style={{ backgroundColor: `rgba(${bgRgb}, 0.9)`, color: favorites.some(f => f.productId === item.id && f.type === 'FOOD') ? '#ef4444' : store.secondary_color }}
                        >
                          <Heart size={12} fill={favorites.some(f => f.productId === item.id && f.type === 'FOOD') ? 'currentColor' : 'none'} />
                        </button>
                        {item.is_vegan && <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center shadow-md"><Leaf size={12} /></div>}
                        {item.is_spicy && <div className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md"><Flame size={12} /></div>}
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          if (hasConfig) {
                            router.push(`/store/${store.slug}/product/${item.id}`)
                          } else {
                            handleAddToCart(item); 
                            setIsCartOpen(true); 
                          }
                        }}
                        className="w-full py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-1.5 shadow-xl hover:opacity-90 transition-opacity backdrop-blur-xl border" 
                        style={{ backgroundColor: `rgba(${hexToRgb(store.primary_color)}, 0.95)`, color: store.background_color, borderColor: `rgba(${bgRgb}, 0.2)` }}
                      >
                        {hasConfig ? 'Choose Options' : <><Plus size={14} /> Add to Order</>}
                      </button>
                    </div>
                  </div>

                  <div className="px-1 flex flex-col flex-1">
                    <h3 className="text-base font-black tracking-tight mb-1 line-clamp-1">{item.name}</h3>
                    <p className="text-xs opacity-60 line-clamp-2 mb-3 font-medium">{item.description}</p>
                    <div className="flex items-center justify-between mt-auto pt-2 border-t" style={{ borderColor: `rgba(${textRgb}, 0.05)` }}>
                      <p className="text-lg font-black tracking-tighter" style={{ color: store.primary_color }}>Br {parseFloat(item.price).toFixed(2)}</p>
                    </div>
                  </div>

                </div>
              )})}
            </div>
          )}
        </div>
      </div>

      {/* CART DRAWER */}
      <div className={`fixed inset-0 z-[200] transition-opacity duration-300 ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
        <div className={`absolute top-0 right-0 h-full w-full sm:w-[400px] shadow-2xl transition-transform duration-500 ease-out flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ backgroundColor: store.background_color, color: store.secondary_color }}>
          
          <div className="p-5 border-b flex items-center justify-between backdrop-blur-xl" style={{ borderColor: `rgba(${textRgb}, 0.1)`, backgroundColor: `rgba(${bgRgb}, 0.9)` }}>
            <h2 className="text-xl font-black tracking-tight">Your Order</h2>
            <button onClick={() => setIsCartOpen(false)} className="p-2 rounded-full hover:bg-black/5 transition-colors"><X size={20} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
            {cartItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center opacity-50">
                <ShoppingBag size={48} className="mb-4" />
                <p className="text-lg font-bold">Your order is empty.</p>
              </div>
            ) : (
              cartItems.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-center bg-white/5 p-3 rounded-xl border shadow-sm" style={{ borderColor: `rgba(${textRgb}, 0.05)` }}>
                  <div className="w-16 h-16 rounded-lg bg-black/5 overflow-hidden shadow-inner shrink-0">
                    {item.image && <img src={item.image} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="text-sm font-bold tracking-tight line-clamp-1">{item.name}</h4>
                    <p className="text-xs opacity-60 mt-0.5">Qty: {item.quantity}</p>
                    {item.special_requests && <p className="text-[10px] opacity-70 mt-1 line-clamp-2">{item.special_requests}</p>}
                    <p className="text-sm font-black mt-2" style={{ color: store.primary_color }}>Br {parseFloat(item.price).toFixed(2)}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="p-2 opacity-50 hover:opacity-100 hover:text-red-500 transition-colors shrink-0"><X size={16}/></button>
                </div>
              ))
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="p-5 border-t backdrop-blur-xl shadow-2xl shrink-0" style={{ borderColor: `rgba(${textRgb}, 0.1)`, backgroundColor: `rgba(${bgRgb}, 0.95)` }}>
              <div className="flex justify-between items-center mb-5 font-black text-lg">
                <span>Subtotal</span>
                <span style={{ color: store.primary_color }}>Br {cartTotal}</span>
              </div>
              <button onClick={handleProceedToCheckout} className="w-full py-3.5 rounded-xl text-sm font-black tracking-widest uppercase shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2" style={{ backgroundColor: store.primary_color, color: store.background_color }}>
                {(!isMounted || !session) && <Lock size={16} />} Secure Checkout
              </button>
            </div>
          )}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </main>
  )
}
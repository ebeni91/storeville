'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Loader2, ShoppingBag, MapPin, Search, Heart, User, ArrowRight, X, Check, Menu, Star, Clock, Bike, Lock, Flame, Leaf, Plus, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

interface MenuCategory { id: string; name: string; order: number }
interface MenuItem { id: string; category: string; category_name: string; name: string; description: string; price: string; image: string | null; preparation_time_minutes: number; is_vegetarian: boolean; is_vegan: boolean; is_spicy: boolean }

export default function FoodStorefront({ store }: { store: any }) {
  const router = useRouter()
  
  // 🌟 UNIVERSAL AUTH STATE
  const { token, logout } = useAuthStore()
  const [isMounted, setIsMounted] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  
  // UI & Cart States
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [cartItems, setCartItems] = useState<any[]>([])

  // Auth States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authData, setAuthData] = useState({ 
    email: '', password: '', username: '', first_name: '', last_name: '', phone_number: '' 
  })
  const [authLoading, setAuthLoading] = useState(false)

  useEffect(() => {
    setIsMounted(true) // Prevent hydration mismatch
  }, [])
    useEffect(() => {
    const wakeUpAuth = async () => {
      if (!token) {
        try {
          await api.get('/accounts/profile/')
        } catch (e) {
          // If this fails, they are genuinely logged out. Do nothing.
        }
      }
    }
    wakeUpAuth()
  }, [token])
  useEffect(() => {
    // 1. Load Cart
    const savedCart = localStorage.getItem(`cart_food_${store.id}`)
    if (savedCart) {
      try { setCartItems(JSON.parse(savedCart)) } catch (e) {}
    }

    // 2. Fetch Menu Architecture
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

  useEffect(() => {
    if (store) localStorage.setItem(`cart_food_${store.id}`, JSON.stringify(cartItems))
  }, [cartItems, store])

  const safeItems = Array.isArray(items) ? items : []
  const filteredItems = safeItems.filter(item => {
    const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleAddToCart = (item: any) => {
    const existing = cartItems.find(cartItem => cartItem.id === item.id)
    if (existing) {
      setCartItems(cartItems.map(cartItem => cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem))
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }])
    }
    setToastMessage(`Added ${item.name} to order.`)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const removeFromCart = (itemId: string) => setCartItems(cartItems.filter(item => item.id !== itemId))

  const handleProceedToCheckout = () => {
    if (token) router.push(`/store/${store.slug}/checkout`)
    else setIsAuthModalOpen(true)
  }

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    try {
      const endpoint = authMode === 'login' ? '/accounts/token/' : '/accounts/register/' 
      
      const payload = authMode === 'login' 
        ? { email: authData.email, password: authData.password } 
        : { 
            email: authData.email, 
            password: authData.password, 
            username: authData.username,
            first_name: authData.first_name,
            last_name: authData.last_name,
            phone_number: authData.phone_number
          }
          
      const res = await api.post(endpoint, payload)
      const accessToken = res.data.access || res.data.token || res.data.key
      
      if (accessToken) {
        useAuthStore.getState().setToken(accessToken)
      }
      
      setIsAuthModalOpen(false)
      router.push(`/store/${store.slug}/checkout`)
      
    } catch (err: any) {
      console.error("Auth Error Details:", err.response || err)
      
      // If CORS or Network Error happens, err.response will be undefined
      if (!err.response) {
        alert("Network Error: Could not reach the server. Please check CORS settings.")
        return
      }

      const data = err.response?.data
      const errorMsg = data?.detail 
        || data?.username?.[0] 
        || data?.email?.[0] 
        || data?.password?.[0] 
        || data?.non_field_errors?.[0]
        || "Authentication failed. Please check your details."
      
      alert(errorMsg)
    } finally {
      setAuthLoading(false)
    }
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-gray-300" size={50} /></div>

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#ffffff');
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
  }
  
  const bgRgb = hexToRgb(store.background_color)
  const textRgb = hexToRgb(store.secondary_color)
  const announceRgb = hexToRgb(store.announcement_color || store.primary_color)
  const cartTotal = cartItems.reduce((acc, curr) => acc + (parseFloat(curr.price) * curr.quantity), 0).toFixed(2)

  return (
    <main className="min-h-screen pb-32 font-sans transition-colors duration-700 relative" style={{ backgroundColor: store.background_color || '#fafafa', color: store.secondary_color || '#111827' }}>
      
      {/* TOAST NOTIFICATION */}
      <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ${toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'}`}>
        <div className="backdrop-blur-xl px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl border" style={{ backgroundColor: `rgba(${textRgb}, 0.9)`, color: store.background_color, borderColor: `rgba(${bgRgb}, 0.1)` }}>
          <Check size={16} />
          <span className="text-sm font-bold tracking-wide">{toastMessage}</span>
        </div>
      </div>

      {/* AUTH MODAL */}
      <div className={`fixed inset-0 z-[300] flex items-center justify-center transition-all duration-500 ${isAuthModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsAuthModalOpen(false)}></div>
        <div className="relative w-full max-w-md p-8 rounded-[2rem] shadow-2xl border transition-transform duration-500 scale-100" style={{ backgroundColor: `rgba(${bgRgb}, 0.95)`, color: store.secondary_color, borderColor: `rgba(${textRgb}, 0.1)` }}>
          <button onClick={() => setIsAuthModalOpen(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 transition-colors"><X size={20} /></button>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner" style={{ backgroundColor: `rgba(${textRgb}, 0.05)` }}>
            <Lock size={28} style={{ color: store.primary_color }} />
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-2">{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-sm opacity-60 font-medium mb-8">Sign in to securely complete your delivery order.</p>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase opacity-60 mb-2">Username</label>
                  <input type="text" required value={authData.username} onChange={e => setAuthData({...authData, username: e.target.value})} className="w-full bg-black/5 border-none rounded-xl p-4 outline-none font-bold focus:ring-2" style={{ color: store.secondary_color }} placeholder="Username" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase opacity-60 mb-2">First Name</label>
                    <input type="text" required value={authData.first_name} onChange={e => setAuthData({...authData, first_name: e.target.value})} className="w-full bg-black/5 border-none rounded-xl p-4 outline-none font-bold focus:ring-2" style={{ color: store.secondary_color }} placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase opacity-60 mb-2">Last Name</label>
                    <input type="text" required value={authData.last_name} onChange={e => setAuthData({...authData, last_name: e.target.value})} className="w-full bg-black/5 border-none rounded-xl p-4 outline-none font-bold focus:ring-2" style={{ color: store.secondary_color }} placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase opacity-60 mb-2">Phone Number</label>
                  <input type="tel" required value={authData.phone_number} onChange={e => setAuthData({...authData, phone_number: e.target.value})} className="w-full bg-black/5 border-none rounded-xl p-4 outline-none font-bold focus:ring-2" style={{ color: store.secondary_color }} placeholder="+251 911 234 567" />
                </div>
              </>
            )}
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase opacity-60 mb-2">Email</label>
              <input type="email" required value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})} className="w-full bg-black/5 border-none rounded-xl p-4 outline-none font-bold focus:ring-2" style={{ color: store.secondary_color }} placeholder="email@example.com" />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase opacity-60 mb-2">Password</label>
              <input type="password" required value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} className="w-full bg-black/5 border-none rounded-xl p-4 outline-none font-bold focus:ring-2" style={{ color: store.secondary_color }} placeholder="••••••••" />
            </div>
            <button type="submit" disabled={authLoading} className="w-full py-4 mt-4 rounded-xl text-sm font-black tracking-widest uppercase shadow-xl hover:opacity-90 transition-opacity flex items-center justify-center" style={{ backgroundColor: store.primary_color, color: '#fff' }}>
              {authLoading ? <Loader2 className="animate-spin" size={20} /> : authMode === 'login' ? 'Sign In & Checkout' : 'Create & Checkout'}
            </button>
          </form>
          <div className="mt-8 text-center">
            <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-sm font-bold opacity-70 hover:opacity-100 transition-opacity">
              {authMode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>

      {/* STICKY GLASS NAVIGATION & MARQUEE */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-2xl border-b transition-all duration-300 flex flex-col" style={{ backgroundColor: `rgba(${bgRgb}, 0.75)`, borderColor: `rgba(${textRgb}, 0.1)` }}>
        {store.announcement_is_active && store.announcement_text && (
          <div className="relative w-full overflow-hidden flex items-center shadow-sm" style={{ backgroundColor: store.announcement_color || store.primary_color, color: store.background_color }}>
            <style dangerouslySetInnerHTML={{__html: `@keyframes premium-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .animate-premium-marquee { display: flex; width: max-content; animation: premium-marquee 25s linear infinite; }`}} />
            <div className="absolute top-0 left-0 w-12 h-full z-10 pointer-events-none" style={{ background: `linear-gradient(to right, rgba(${announceRgb}, 1), rgba(${announceRgb}, 0))` }}></div>
            <div className="absolute top-0 right-0 w-12 h-full z-10 pointer-events-none" style={{ background: `linear-gradient(to left, rgba(${announceRgb}, 1), rgba(${announceRgb}, 0))` }}></div>
            <div className="animate-premium-marquee py-2.5 cursor-default">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="flex items-center shrink-0">
                  <span className="text-[11px] font-black tracking-[0.25em] uppercase mx-6 drop-shadow-sm">{store.announcement_text}</span>
                  <span className="opacity-40 text-[10px]">✦</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Menu className="lg:hidden cursor-pointer" size={24} />
            <div className="flex items-center gap-3 cursor-pointer">
              {store.logo && <img src={store.logo} alt="Logo" className="w-8 h-8 rounded-full object-cover shadow-sm border border-white/20" />}
              <span className="text-xl md:text-2xl font-black tracking-tighter" style={{ fontFamily: `"${store.heading_font || 'Inter'}", sans-serif` }}>{store.name}</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center bg-black/5 rounded-full px-5 py-2.5 w-[400px] border shadow-inner transition-all hover:shadow-md" style={{ borderColor: `rgba(${textRgb}, 0.1)`, backgroundColor: `rgba(${textRgb}, 0.03)` }}>
            <Search size={16} style={{ opacity: 0.5 }} />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search for dishes..." className="bg-transparent border-none outline-none px-3 w-full text-sm font-medium" style={{ color: store.secondary_color }} />
          </div>

          <div className="flex items-center gap-6 md:gap-8">
            {/* 🌟 UNIVERSAL BUYER PROFILE DROPDOWN */}
            <div className="relative">
              <button 
                onClick={() => (isMounted && token) ? setIsUserMenuOpen(!isUserMenuOpen) : setIsAuthModalOpen(true)} 
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
              >
                <User size={22} className={(isMounted && token) ? "text-indigo-600" : ""} />
              </button>
              
              {isUserMenuOpen && isMounted && token && (
                <div className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 p-2 z-[100] animate-in fade-in slide-in-from-top-2" style={{ borderColor: `rgba(${textRgb}, 0.1)` }}>
                  <div className="px-3 py-2 border-b border-gray-100 mb-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">My Account</p>
                  </div>
                  <button onClick={() => router.push('/profile')} className="w-full text-left px-3 py-3 text-sm font-bold text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-colors flex items-center gap-3">
                    <User size={16} /> Global Profile & Orders
                  </button>
                  <button onClick={() => {
                    logout()
                    setIsUserMenuOpen(false)
                    window.location.reload()
                  }} className="w-full text-left px-3 py-3 text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors flex items-center gap-3 mt-1">
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>

            <div className="relative cursor-pointer hover:scale-110 transition-transform" onClick={() => setIsCartOpen(true)}>
              <ShoppingBag size={22} />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold shadow-md" style={{ backgroundColor: store.primary_color, color: store.background_color }}>
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Food Specific: Horizontal Category Bar inside Nav */}
        <div className="w-full border-t flex overflow-x-auto hide-scrollbar" style={{ borderColor: `rgba(${textRgb}, 0.05)` }}>
           <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 py-3 flex gap-4">
              <button onClick={() => setActiveCategory('ALL')} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors`} style={{ backgroundColor: activeCategory === 'ALL' ? store.primary_color : 'transparent', color: activeCategory === 'ALL' ? store.background_color : store.secondary_color, border: `1px solid ${activeCategory === 'ALL' ? 'transparent' : `rgba(${textRgb}, 0.2)`}` }}>
                Full Menu
              </button>
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors`} style={{ backgroundColor: activeCategory === cat.id ? store.primary_color : 'transparent', color: activeCategory === cat.id ? store.background_color : store.secondary_color, border: `1px solid ${activeCategory === cat.id ? 'transparent' : `rgba(${textRgb}, 0.2)`}` }}>
                  {cat.name}
                </button>
              ))}
           </div>
        </div>
      </nav>

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
              {filteredItems.map(item => (
                <div key={item.id} className="group cursor-pointer flex flex-col rounded-2xl p-2 border shadow-sm hover:shadow-xl transition-all duration-500 bg-white/5 backdrop-blur-sm hover:-translate-y-1.5" style={{ borderColor: `rgba(${textRgb}, 0.05)` }}>
                  
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
                        {item.is_vegan && <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center shadow-md"><Leaf size={12} /></div>}
                        {item.is_spicy && <div className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md"><Flame size={12} /></div>}
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(item); setIsCartOpen(true); }}
                        className="w-full py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-1.5 shadow-xl hover:opacity-90 transition-opacity backdrop-blur-xl border" 
                        style={{ backgroundColor: `rgba(${hexToRgb(store.primary_color)}, 0.95)`, color: store.background_color, borderColor: `rgba(${bgRgb}, 0.2)` }}
                      >
                        <Plus size={14} /> Add to Order
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
              ))}
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
                    <p className="text-sm font-black mt-2" style={{ color: store.primary_color }}>Br {item.price}</p>
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
                {(!isMounted || !token) && <Lock size={16} />} Secure Checkout
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
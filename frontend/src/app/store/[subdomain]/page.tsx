'use client'

import React, { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Loader2, ShoppingBag, MapPin, Search, Heart, User, SlidersHorizontal, ArrowRight, X, Check, Menu, Star, CheckCircle, ChevronLeft, Lock } from 'lucide-react'

export default function StorefrontPage({ params }: { params: { subdomain: string } }) {
  const [store, setStore] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // UI States
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [cartItems, setCartItems] = useState<any[]>([])
  
  // Checkout & Auth States
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout' | 'success'>('cart')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  // Auth Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authData, setAuthData] = useState({ email: '', password: '', username: '' })
  const [authLoading, setAuthLoading] = useState(false)

  const [formData, setFormData] = useState({
    customer_name: '',
    contact_phone: '',
    delivery_address: '',
    delivery_method: '',
    payment_method: 'COD'
  })

  useEffect(() => {
    // Check local storage for JWT token on load
    const token = localStorage.getItem('access_token') || localStorage.getItem('token')
    if (token) {
      setIsAuthenticated(true)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }

    const fetchAll = async () => {
      try {
        const storeRes = await api.get(`/stores/discovery/${params.subdomain}/`)
        setStore(storeRes.data)
        setFormData(prev => ({ ...prev, delivery_method: storeRes.data.store_type === 'FOOD' ? 'ASAP_DELIVERY' : 'STANDARD_DELIVERY' }))
        const prodRes = await api.get(`/products/storefront/?store=${params.subdomain}`)
        setProducts(Array.isArray(prodRes.data) ? prodRes.data : prodRes.data.results || [])
      } catch (err) { console.error(err) } finally { setIsLoading(false) }
    }
    fetchAll()
  }, [params.subdomain])

  const handleAddToCart = (product: any) => {
    setCartItems([...cartItems, { ...product, quantity: 1 }])
    setToastMessage(`Added ${product.name} to your cart.`)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // --- ACTIONS ---

  const handleProceedToCheckout = () => {
    if (isAuthenticated) {
      setCheckoutStep('checkout')
    } else {
      setIsAuthModalOpen(true)
    }
  }

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    try {
      // NOTE: Ensure these endpoints exactly match your Django urls.py
      const endpoint = authMode === 'login' ? '/accounts/login/' : '/accounts/register/' 
      const payload = authMode === 'login' 
        ? { email: authData.email, password: authData.password }
        : { email: authData.email, password: authData.password, username: authData.username }

      const res = await api.post(endpoint, payload)
      const token = res.data.access || res.data.token || res.data.key
      
      if (token) {
        localStorage.setItem('access_token', token)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setIsAuthenticated(true)
        setIsAuthModalOpen(false)
        setCheckoutStep('checkout')
      } else {
        alert("Login succeeded but no token was returned. Check backend.")
      }
    } catch (err: any) {
      console.error(err)
      const errorMsg = err.response?.data?.detail || err.response?.data?.email?.[0] || "Authentication failed."
      alert(errorMsg)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleCheckoutSubmit = async () => {
    if (!formData.customer_name || !formData.contact_phone) {
      alert("Please fill in your name and phone number.")
      return
    }
    setIsSubmitting(true)
    try {
      const payload = {
        store_id: store.id,
        ...formData,
        items: cartItems.map(item => ({ product_id: item.id, name: item.name, price: item.price, quantity: item.quantity }))
      }
      await api.post('/orders/checkout/', payload)
      setCheckoutStep('success')
      setCartItems([]) 
    } catch (error) {
      console.error(error)
      alert("Failed to place order. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeDrawer = () => {
    setIsCartOpen(false)
    setTimeout(() => setCheckoutStep('cart'), 300) 
  }

  // --- RENDER HELPERS ---

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-gray-300" size={50} /></div>
  if (!store) return <div className="min-h-screen flex items-center justify-center"><h1 className="text-3xl font-light opacity-50">Store Unavailable</h1></div>

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
  }
  const bgRgb = hexToRgb(store.background_color)
  const textRgb = hexToRgb(store.secondary_color)
  const announceRgb = hexToRgb(store.announcement_color || store.primary_color)
  const cartTotal = cartItems.reduce((acc, curr) => acc + parseFloat(curr.price), 0).toFixed(2)

  const isFood = store.store_type === 'FOOD'
  const deliveryOptions = isFood 
    ? [{ id: 'ASAP_DELIVERY', label: 'ASAP GPS Delivery' }, { id: 'PICKUP_FOOD', label: 'Pick Up In-Store' }]
    : [{ id: 'STANDARD_DELIVERY', label: 'Standard Local Delivery' }, { id: 'EXPRESS_COURIER', label: 'Express Courier' }, { id: 'STORE_PICKUP_RETAIL', label: 'Store Pickup' }]

  return (
    <main className="min-h-screen pb-32 font-sans transition-colors duration-700 relative" style={{ backgroundColor: store.background_color, color: store.secondary_color }}>
      
      {/* TOAST NOTIFICATION */}
      <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ${toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'}`}>
        <div className="backdrop-blur-xl px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl border" style={{ backgroundColor: `rgba(${textRgb}, 0.9)`, color: store.background_color, borderColor: `rgba(${bgRgb}, 0.1)` }}>
          <Check size={16} />
          <span className="text-sm font-bold tracking-wide">{toastMessage}</span>
        </div>
      </div>

      {/* 🌟 PREMIUM AUTH MODAL 🌟 */}
      <div className={`fixed inset-0 z-[300] flex items-center justify-center transition-all duration-500 ${isAuthModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsAuthModalOpen(false)}></div>
        
        <div className="relative w-full max-w-md p-8 rounded-[2rem] shadow-2xl border transition-transform duration-500 scale-100" style={{ backgroundColor: `rgba(${bgRgb}, 0.95)`, color: store.secondary_color, borderColor: `rgba(${textRgb}, 0.1)` }}>
          <button onClick={() => setIsAuthModalOpen(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 transition-colors"><X size={20} /></button>
          
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner" style={{ backgroundColor: `rgba(${textRgb}, 0.05)` }}>
            <Lock size={28} style={{ color: store.primary_color }} />
          </div>
          
          <h2 className="text-3xl font-black tracking-tight mb-2">{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-sm opacity-60 font-medium mb-8">Sign in to securely complete your purchase and track your order.</p>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase opacity-60 mb-2">Username</label>
                <input type="text" required value={authData.username} onChange={e => setAuthData({...authData, username: e.target.value})} className="w-full bg-black/5 border-none rounded-xl p-4 outline-none font-bold focus:ring-2" style={{ color: store.secondary_color }} placeholder="StorevilleUser" />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase opacity-60 mb-2">Email Address</label>
              <input type="email" required value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})} className="w-full bg-black/5 border-none rounded-xl p-4 outline-none font-bold focus:ring-2" style={{ color: store.secondary_color }} placeholder="you@example.com" />
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
          <div className="relative w-full overflow-hidden flex items-center shadow-sm" style={{ backgroundColor: store.announcement_color, color: store.background_color }}>
            <style dangerouslySetInnerHTML={{__html: `@keyframes premium-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .animate-premium-marquee { display: flex; width: max-content; animation: premium-marquee 25s linear infinite; } .animate-premium-marquee:hover { animation-play-state: paused; }`}} />
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
              <span className="text-xl md:text-2xl font-black tracking-tighter" style={{ fontFamily: `"${store.heading_font}", sans-serif` }}>{store.name}</span>
            </div>
          </div>
          <div className="hidden lg:flex items-center bg-black/5 rounded-full px-5 py-2.5 w-[400px] border shadow-inner transition-all hover:shadow-md" style={{ borderColor: `rgba(${textRgb}, 0.1)`, backgroundColor: `rgba(${textRgb}, 0.03)` }}>
            <Search size={16} style={{ opacity: 0.5 }} />
            <input type="text" placeholder="Search curated collection..." className="bg-transparent border-none outline-none px-3 w-full text-sm font-medium" style={{ color: store.secondary_color }} />
          </div>
          <div className="flex items-center gap-6 md:gap-8">
            <User size={22} className="cursor-pointer hover:scale-110 transition-transform hidden md:block" />
            <Heart size={22} className="cursor-pointer hover:scale-110 transition-transform hidden md:block" />
            <div className="relative cursor-pointer hover:scale-110 transition-transform" onClick={() => setIsCartOpen(true)}>
              <ShoppingBag size={22} />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold shadow-md" style={{ backgroundColor: store.primary_color, color: store.background_color }}>
                  {cartItems.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
        <header className="relative w-full h-[55vh] md:h-[60vh] rounded-[2rem] md:rounded-[3rem] flex flex-col items-center justify-center overflow-hidden shadow-xl border" style={{ borderColor: `rgba(${textRgb}, 0.05)` }}>
          {store.banner ? (
             <img src={store.banner} className="absolute inset-0 w-full h-full object-cover" alt="Banner" />
          ) : (
             <div className="absolute inset-0 opacity-20" style={{ backgroundColor: store.primary_color }}></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40"></div>

          <div className="relative z-10 flex flex-col items-center text-center px-4 mt-8">
            <div className="flex items-center gap-3 mb-6 backdrop-blur-md bg-white/10 px-5 py-2.5 rounded-full border border-white/20 text-white shadow-lg">
              <span className="flex items-center gap-1 text-sm font-bold"><Star size={14} className="fill-yellow-400 text-yellow-400" /> 4.9 Store Rating</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
              <span className="flex items-center gap-1.5 text-sm font-bold"><CheckCircle size={14} className="text-blue-400" /> Verified Seller</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/50 hidden md:block"></span>
              <span className="hidden md:flex items-center gap-1.5 text-sm font-bold"><MapPin size={14} className="text-white/80" /> {store.city}</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white drop-shadow-xl mb-4 leading-none max-w-5xl" style={{ fontFamily: `"${store.heading_font}", sans-serif` }}>
              {store.name}
            </h1>
            {store.description && (
              <p className="max-w-2xl text-white/90 text-base md:text-lg font-medium leading-relaxed mb-8 drop-shadow-md px-4">{store.description}</p>
            )}
            <button className="px-8 py-3.5 rounded-full font-black tracking-widest uppercase text-xs flex items-center gap-2 hover:scale-105 transition-all shadow-2xl backdrop-blur-md" style={{ backgroundColor: store.primary_color, color: '#fff' }}>
              Shop Collection <ArrowRight size={16} />
            </button>
          </div>
        </header>
      </div>

      {/* MAIN LAYOUT (SIDEBAR + GRID) */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-8 flex flex-col lg:flex-row gap-10">
        
        {/* SIDEBAR FILTERS */}
        <aside className="w-full lg:w-60 shrink-0 hidden lg:block">
          <div className="sticky top-40 space-y-10">
            <div>
              <h3 className="text-base font-black flex items-center gap-2 mb-6 tracking-tight"><SlidersHorizontal size={18}/> Filters</h3>
              <div className="space-y-3">
                <h4 className="font-bold text-xs tracking-widest uppercase opacity-60">Categories</h4>
                {['All Products', 'New Arrivals', 'Best Sellers', 'Accessories'].map((cat, i) => (
                  <div key={i} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-3.5 h-3.5 rounded-full border ${i === 0 ? 'border-transparent' : ''} transition-colors`} style={{ backgroundColor: i===0 ? store.primary_color : 'transparent', borderColor: i===0 ? store.primary_color : `rgba(${textRgb}, 0.3)` }}></div>
                    <span className={`text-sm font-medium ${i===0 ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>{cat}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-8 border-t" style={{ borderColor: `rgba(${textRgb}, 0.1)` }}>
               <h4 className="font-bold text-xs tracking-widest uppercase opacity-60 mb-5">Price Range</h4>
               <input type="range" className="w-full accent-black cursor-pointer h-1" style={{ accentColor: store.primary_color }}/>
               <div className="flex justify-between text-[10px] font-bold mt-3 opacity-60 uppercase tracking-widest"><span>Br 0</span><span>Br 10,000+</span></div>
            </div>
          </div>
        </aside>

        {/* COMPACT PRODUCT GRID */}
        <section className="flex-1">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight" style={{ fontFamily: `"${store.heading_font}", sans-serif` }}>Curated Pieces</h2>
            <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full border shadow-sm" style={{ borderColor: `rgba(${textRgb}, 0.2)` }}>{products.length} Items</span>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-40 rounded-[3rem] border-2 border-dashed" style={{ borderColor: `rgba(${textRgb}, 0.1)` }}>
              <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-xl font-black tracking-tight opacity-50">Collection Empty</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
              {products.map(p => (
                <div key={p.id} className="group cursor-pointer flex flex-col rounded-2xl p-2 border shadow-sm hover:shadow-xl transition-all duration-500 bg-white/5 backdrop-blur-sm hover:-translate-y-1.5" style={{ borderColor: `rgba(${textRgb}, 0.05)` }}>
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-black/5 mb-3 shadow-inner">
                    {p.image ? (
                      <img src={p.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={p.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-10"><ShoppingBag size={30}/></div>
                    )}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                      {p.category_name && (
                        <div className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md backdrop-blur-md shadow-sm" style={{ backgroundColor: `rgba(${bgRgb}, 0.9)`, color: store.secondary_color }}>{p.category_name}</div>
                      )}
                      <button className="w-7 h-7 rounded-full backdrop-blur-md flex items-center justify-center hover:scale-110 transition-transform shadow-sm" style={{ backgroundColor: `rgba(${bgRgb}, 0.9)`, color: store.secondary_color }}><Heart size={12} /></button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(p); }}
                        className="w-full py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-1.5 shadow-xl hover:opacity-90 transition-opacity backdrop-blur-xl border" 
                        style={{ backgroundColor: `rgba(${hexToRgb(store.primary_color)}, 0.95)`, color: store.background_color, borderColor: `rgba(${bgRgb}, 0.2)` }}
                      >
                        Quick Add <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="px-1 flex flex-col flex-1">
                    <h3 className="text-sm font-black tracking-tight mb-0.5 line-clamp-1">{p.name}</h3>
                    <p className="text-[11px] opacity-60 line-clamp-1 mb-3 font-medium">{p.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <p className="text-base font-black tracking-tighter" style={{ color: store.primary_color }}>Br {p.price}</p>
                      <div className="flex items-center gap-1 opacity-50"><span className="text-[10px] font-bold">4.9</span><Star size={10} className="fill-current text-current"/></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* 🚀 FIXED CLEAN CART DRAWER 🚀 */}
      <div className={`fixed inset-0 z-[200] transition-opacity duration-300 ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeDrawer}></div>
        
        <div className={`absolute top-0 right-0 h-full w-full sm:w-[400px] shadow-2xl transition-transform duration-500 ease-out flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ backgroundColor: store.background_color, color: store.secondary_color }}>
          
          <div className="p-5 border-b flex items-center justify-between backdrop-blur-xl shrink-0" style={{ borderColor: `rgba(${textRgb}, 0.1)`, backgroundColor: `rgba(${bgRgb}, 0.9)` }}>
            {checkoutStep === 'checkout' ? (
              <button onClick={() => setCheckoutStep('cart')} className="flex items-center gap-2 text-sm font-bold hover:opacity-70 transition-opacity">
                <ChevronLeft size={18} /> Back to Cart
              </button>
            ) : (
              <h2 className="text-xl font-black tracking-tight">Your Cart</h2>
            )}
            <button onClick={closeDrawer} className="p-2 rounded-full hover:bg-black/5 transition-colors"><X size={20} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            
            {/* VIEW 1: CART ITEMS */}
            {checkoutStep === 'cart' && (
              <div className="flex flex-col gap-4 animate-in fade-in">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center opacity-50 mt-20">
                    <ShoppingBag size={48} className="mb-4" />
                    <p className="text-lg font-bold">Your cart is empty.</p>
                  </div>
                ) : (
                  cartItems.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center bg-white/5 p-3 rounded-xl border shadow-sm" style={{ borderColor: `rgba(${textRgb}, 0.05)` }}>
                      <div className="w-16 h-20 rounded-lg bg-black/5 overflow-hidden shadow-inner shrink-0">
                        {item.image && <img src={item.image} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="text-sm font-bold tracking-tight line-clamp-1">{item.name}</h4>
                        <p className="text-xs opacity-60 mt-0.5">Qty: {item.quantity}</p>
                        <p className="text-sm font-black mt-2" style={{ color: store.primary_color }}>Br {item.price}</p>
                      </div>
                      <button className="p-2 opacity-50 hover:opacity-100 hover:text-red-500 transition-colors shrink-0"><X size={16}/></button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* VIEW 2: CHECKOUT FORM */}
            {checkoutStep === 'checkout' && (
              <div className="space-y-5 animate-in slide-in-from-right-8">
                <h3 className="text-lg font-black tracking-tight mb-2">Delivery Details</h3>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase opacity-60 mb-2">Full Name</label>
                  <input type="text" value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} className="w-full bg-black/5 border-none rounded-xl p-3 outline-none font-bold focus:ring-2 text-sm" style={{ color: store.secondary_color }} placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase opacity-60 mb-2">Phone Number</label>
                  <input type="tel" value={formData.contact_phone} onChange={e => setFormData({...formData, contact_phone: e.target.value})} className="w-full bg-black/5 border-none rounded-xl p-3 outline-none font-bold focus:ring-2 text-sm" style={{ color: store.secondary_color }} placeholder="+251..." />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase opacity-60 mb-2">Delivery Address / Note</label>
                  <textarea value={formData.delivery_address} onChange={e => setFormData({...formData, delivery_address: e.target.value})} className="w-full bg-black/5 border-none rounded-xl p-3 outline-none font-medium text-sm focus:ring-2 min-h-[80px]" style={{ color: store.secondary_color }} placeholder="Delivery details..." />
                </div>

                <div className="pt-4 border-t" style={{ borderColor: `rgba(${textRgb}, 0.1)` }}>
                  <label className="block text-[10px] font-bold tracking-widest uppercase opacity-60 mb-3">Delivery Method</label>
                  <div className="grid grid-cols-1 gap-2">
                    {deliveryOptions.map(opt => (
                      <div key={opt.id} onClick={() => setFormData({...formData, delivery_method: opt.id})} className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${formData.delivery_method === opt.id ? 'shadow-md' : 'opacity-60'}`} style={{ borderColor: formData.delivery_method === opt.id ? store.primary_color : `rgba(${textRgb}, 0.1)` }}>
                        <span className="font-bold text-xs">{opt.label}</span>
                        {formData.delivery_method === opt.id && <CheckCircle size={16} style={{ color: store.primary_color }}/>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t" style={{ borderColor: `rgba(${textRgb}, 0.1)` }}>
                  <label className="block text-[10px] font-bold tracking-widest uppercase opacity-60 mb-3">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['COD', 'TELEBIRR'].map(method => (
                      <div key={method} onClick={() => setFormData({...formData, payment_method: method})} className={`p-3 rounded-xl border-2 cursor-pointer transition-all text-center ${formData.payment_method === method ? 'shadow-md' : 'opacity-60'}`} style={{ borderColor: formData.payment_method === method ? store.primary_color : `rgba(${textRgb}, 0.1)` }}>
                        <span className="font-black text-xs">{method === 'COD' ? 'Cash' : 'Telebirr'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 3: SUCCESS */}
            {checkoutStep === 'success' && (
              <div className="h-full flex flex-col items-center justify-center text-center animate-in zoom-in-95">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-2xl" style={{ backgroundColor: store.primary_color, color: '#fff' }}>
                  <Check size={40} />
                </div>
                <h3 className="text-2xl font-black tracking-tight mb-2">Order Received!</h3>
                <p className="opacity-70 font-medium text-sm max-w-[250px]">The store has been notified. They will contact you shortly regarding delivery.</p>
                <button onClick={closeDrawer} className="mt-8 px-6 py-3 rounded-xl font-black tracking-widest uppercase text-xs bg-black/5 hover:bg-black/10 transition-colors">Continue Shopping</button>
              </div>
            )}

          </div>

          {/* DRAWER FOOTER */}
          {checkoutStep !== 'success' && cartItems.length > 0 && (
            <div className="p-5 border-t backdrop-blur-xl shadow-2xl shrink-0" style={{ borderColor: `rgba(${textRgb}, 0.1)`, backgroundColor: `rgba(${bgRgb}, 0.95)` }}>
              <div className="flex justify-between items-center mb-4 font-black text-base">
                <span>Total</span>
                <span style={{ color: store.primary_color }}>Br {cartTotal}</span>
              </div>
              
              {checkoutStep === 'cart' ? (
                <button onClick={handleProceedToCheckout} className="w-full py-3.5 rounded-xl text-xs font-black tracking-widest uppercase shadow-xl hover:scale-[1.02] transition-transform flex justify-center items-center gap-2" style={{ backgroundColor: store.primary_color, color: store.background_color }}>
                  {!isAuthenticated && <Lock size={14} />} Secure Checkout
                </button>
              ) : (
                <button onClick={handleCheckoutSubmit} disabled={isSubmitting} className="w-full py-3.5 rounded-xl text-xs font-black tracking-widest uppercase shadow-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2" style={{ backgroundColor: store.primary_color, color: store.background_color }}>
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : `Confirm Order (Br ${cartTotal})`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

    </main>
  )
}
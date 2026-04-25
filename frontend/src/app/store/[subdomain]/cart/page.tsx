'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ShoppingBag, X, Plus, Minus, ArrowLeft, ArrowRight, Trash2, Loader2, User, Heart } from 'lucide-react'
import ProfileDropdown from '@/components/ProfileDropdown'
import { useCartStore } from '@/store/cartStore'
import { authClient } from '@/lib/auth-client'
import { api } from '@/lib/api'

export default function CartPage() {
  const router = useRouter()
  const params = useParams()
  const subdomain = params.subdomain as string

  const [store, setStore] = useState<any>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const { data: session } = authClient.useSession()
  const { carts, addItem, removeItem, updateQuantity, mergeCartWithBackend } = useCartStore()

  useEffect(() => { setIsMounted(true) }, [])

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await api.get(`/stores/discovery/by_slug/?slug=${subdomain}`)
        if (res.data) setStore(res.data)
      } catch (err) { console.error(err) }
    }
    if (subdomain) fetchStore()
  }, [subdomain])

  const cartItems = isMounted && store ? (carts[store.id] || []) : []

  const hexToRgb = (hex: string) => {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#ffffff')
    return r ? `${parseInt(r[1], 16)}, ${parseInt(r[2], 16)}, ${parseInt(r[3], 16)}` : '255,255,255'
  }

  const bgRgb = store ? hexToRgb(store.background_color) : '255,255,255'
  const textRgb = store ? hexToRgb(store.secondary_color) : '0,0,0'

  const subtotal = cartItems.reduce((acc, item) => {
    const extras = (item.selectedExtras || []).reduce((s: number, e: any) => s + parseFloat(e.price || 0), 0)
    return acc + (parseFloat(item.price) + extras) * item.quantity
  }, 0)

  const handleSignOut = async () => {
    await authClient.signOut({ fetchOptions: { onSuccess: () => { setIsUserMenuOpen(false); window.location.reload() } } })
  }

  const handleProceedToCheckout = async () => {
    if (!session) {
      router.push(`/store/${subdomain}`)
      return
    }
    setIsSyncing(true)
    try {
      if (cartItems.length > 0 && store) {
        await mergeCartWithBackend(store.id, store.store_type === 'FOOD' ? 'FOOD' : 'RETAIL')
      }
    } catch (err) { console.error(err) }
    setIsSyncing(false)
    router.push(`/store/${subdomain}/checkout`)
  }

  if (!store || !isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-300" size={48} />
      </div>
    )
  }

  return (
    <main
      className="min-h-screen font-sans"
      style={{ backgroundColor: store.background_color || '#fafafa', color: store.secondary_color || '#111' }}
    >
      {/* ── UNIFIED STICKY HEADER ── */}
      <div className="sticky top-0 z-[150] flex flex-col w-full">
        {/* ANNOUNCEMENT BAR */}
        {(store.announcement_is_active && store.announcement_text) && (
          <div className="w-full px-4 pt-4 md:pt-6 lg:pt-8 pb-2 max-w-[1400px] mx-auto pointer-events-none">
            <div className="w-full py-2.5 px-4 text-xs font-black tracking-widest uppercase shadow-md rounded-2xl overflow-hidden whitespace-nowrap pointer-events-auto border" style={{ backgroundColor: store.announcement_color || store.primary_color, color: '#fff', borderColor: 'rgba(255,255,255,0.1)' }}>
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

        {/* NAVBAR */}
        <div
          className="px-4 py-4 md:py-6 border-b w-full"
          style={{ backgroundColor: `rgba(${bgRgb}, 0.85)`, backdropFilter: 'blur(16px)', borderColor: `rgba(${textRgb}, 0.05)` }}
        >
          <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => router.push(`/store/${store.slug}`)} className="p-2.5 rounded-full hover:scale-105 transition-transform" style={{ backgroundColor: `rgba(${textRgb}, 0.05)`, color: store.secondary_color }}>
                <ArrowLeft size={20} />
              </button>
              <div className="hidden sm:flex flex-col">
                <span className="text-lg font-black tracking-tighter leading-none">{store.name}</span>
                <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest mt-1">Cart ({cartItems.length})</span>
              </div>
              <h1 className="sm:hidden text-xl font-black tracking-tight ml-2">Cart</h1>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <button onClick={() => router.push(`/store/${store.slug}/cart`)} className="p-3 rounded-full hover:scale-105 transition-transform relative" style={{ backgroundColor: `rgba(${textRgb}, 0.05)`, color: store.secondary_color }}>
                <ShoppingBag size={20} />
                {cartItems.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg animate-bounce" style={{ backgroundColor: store.primary_color }}>{cartItems.length}</span>}
              </button>
              <button onClick={() => router.push(`/store/${store.slug}/wishlist`)} className="p-3 rounded-full hover:scale-105 transition-transform" style={{ backgroundColor: `rgba(${textRgb}, 0.05)`, color: store.secondary_color }}>
                <Heart size={20} />
              </button>
              <div className="relative">
                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="p-3 rounded-full hover:scale-105 transition-transform" style={{ backgroundColor: `rgba(${textRgb}, 0.05)`, color: store.secondary_color }}>
                  <User size={20} />
                </button>
                <ProfileDropdown isOpen={isUserMenuOpen} onClose={() => setIsUserMenuOpen(false)} onSignOut={handleSignOut} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div
              className="w-24 h-24 rounded-[2rem] flex items-center justify-center border-2 border-dashed"
              style={{ borderColor: `rgba(${textRgb}, 0.15)` }}
            >
              <ShoppingBag size={36} className="opacity-20" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-black tracking-tight mb-2">Your cart is empty</h2>
              <p className="text-sm opacity-50 font-medium">Add some items from the store first.</p>
            </div>
            <button
              onClick={() => router.push(`/store/${subdomain}`)}
              className="px-8 py-3.5 rounded-full text-sm font-black tracking-widest uppercase transition-all hover:scale-105 shadow-xl"
              style={{ backgroundColor: store.primary_color, color: store.background_color }}
            >
              Browse Store
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {cartItems.map((item, idx) => {
              const extras = item.selectedExtras || []
              const extraTotal = extras.reduce((s: number, e: any) => s + parseFloat(e.price || 0), 0)
              const itemTotal = (parseFloat(item.price) + extraTotal) * item.quantity
              return (
                <div
                  key={`${item.id}-${idx}`}
                  className="flex gap-4 p-4 rounded-2xl border shadow-sm"
                  style={{ borderColor: `rgba(${textRgb}, 0.06)`, backgroundColor: `rgba(${textRgb}, 0.02)` }}
                >
                  {/* Image */}
                  <div className="w-20 h-20 rounded-xl bg-black/5 overflow-hidden shrink-0 shadow-inner">
                    {item.image
                      ? <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                      : <div className="w-full h-full flex items-center justify-center opacity-10"><ShoppingBag size={24} /></div>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-base tracking-tight line-clamp-1">{item.name}</h3>
                    {item.selectedOption && (
                      <p className="text-xs opacity-60 font-medium mt-0.5">{item.selectedOption.name}: {item.selectedOption.choice}</p>
                    )}
                    {extras.length > 0 && (
                      <p className="text-xs opacity-50 font-medium">{extras.map((e: any) => e.name).join(', ')}</p>
                    )}
                    <p className="text-sm font-black mt-1" style={{ color: store.primary_color }}>
                      Br {itemTotal.toFixed(2)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => {
                          if (item.quantity <= 1) removeItem(store.id, item.id)
                          else updateQuantity?.(store.id, item.id, item.quantity - 1)
                        }}
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
                        style={{ backgroundColor: `rgba(${textRgb}, 0.08)` }}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="font-black text-sm w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity?.(store.id, item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
                        style={{ backgroundColor: store.primary_color, color: store.background_color }}
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => removeItem(store.id, item.id)}
                        className="ml-auto p-1.5 rounded-lg opacity-40 hover:opacity-100 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Order Summary */}
            <div
              className="mt-4 p-6 rounded-2xl border"
              style={{ borderColor: `rgba(${textRgb}, 0.08)`, backgroundColor: `rgba(${textRgb}, 0.02)` }}
            >
              <h3 className="font-black text-base mb-4 tracking-tight">Order Summary</h3>
              <div className="flex justify-between text-sm font-medium opacity-70 mb-2">
                <span>Subtotal ({cartItems.length} items)</span>
                <span>Br {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium opacity-70 mb-4">
                <span>Delivery</span>
                <span className="text-green-600 font-black">Calculated at checkout</span>
              </div>
              <div
                className="flex justify-between font-black text-lg pt-4 border-t"
                style={{ borderColor: `rgba(${textRgb}, 0.08)` }}
              >
                <span>Total</span>
                <span style={{ color: store.primary_color }}>Br {subtotal.toFixed(2)}</span>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleProceedToCheckout}
              disabled={isSyncing}
              className="w-full py-4 rounded-2xl font-black tracking-widest uppercase text-sm shadow-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.01] disabled:opacity-70"
              style={{ backgroundColor: store.primary_color, color: store.background_color }}
            >
              {isSyncing ? <Loader2 size={18} className="animate-spin" /> : <>Proceed to Checkout <ArrowRight size={18} /></>}
            </button>

            <button
              onClick={() => router.push(`/store/${subdomain}`)}
              className="w-full py-3.5 rounded-2xl font-black tracking-widest uppercase text-xs opacity-50 hover:opacity-100 transition-opacity"
            >
              ← Continue Shopping
            </button>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-100%); } }
      ` }} />
    </main>
  )
}

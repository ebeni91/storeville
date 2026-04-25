'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Heart, ShoppingBag, ArrowLeft, Loader2, X, User } from 'lucide-react'
import ProfileDropdown from '@/components/ProfileDropdown'
import { useFavoriteStore } from '@/store/favoriteStore'
import { useCartStore } from '@/store/cartStore'
import { authClient } from '@/lib/auth-client'
import { api } from '@/lib/api'

export default function WishlistPage() {
  const router = useRouter()
  const params = useParams()
  const subdomain = params.subdomain as string

  const [store, setStore] = useState<any>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const { data: session } = authClient.useSession()
  const { favorites, fetchFavorites, toggleFavorite } = useFavoriteStore()
  const { addItem } = useCartStore()

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

  useEffect(() => {
    if (session) fetchFavorites()
  }, [session])

  const hexToRgb = (hex: string) => {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#ffffff')
    return r ? `${parseInt(r[1], 16)}, ${parseInt(r[2], 16)}, ${parseInt(r[3], 16)}` : '255,255,255'
  }

  const bgRgb = store ? hexToRgb(store.background_color) : '255,255,255'
  const textRgb = store ? hexToRgb(store.secondary_color) : '0,0,0'

  const handleAddToCart = (fav: any) => {
    if (!store) return
    addItem(store.id, {
      id: fav.productId,
      name: fav.name || 'Product',
      price: fav.price || '0',
      quantity: 1,
      image: fav.image || null,
    })
    setToastMessage(`${fav.name || 'Item'} added to cart!`)
    setToastMessage(`${fav.name || 'Item'} added to cart!`)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleSignOut = async () => {
    await authClient.signOut({ fetchOptions: { onSuccess: () => { setIsUserMenuOpen(false); window.location.reload() } } })
  }

  const storeFavorites = favorites.filter((f: any) => f.storeId === store?.id)

  if (!isMounted || !store) {
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
      {/* Toast */}
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] transition-all duration-500 ${toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div
          className="backdrop-blur-xl px-6 py-3 rounded-full shadow-2xl border text-sm font-bold flex items-center gap-2"
          style={{ backgroundColor: `rgba(${textRgb}, 0.9)`, color: store.background_color, borderColor: `rgba(${bgRgb}, 0.1)` }}
        >
          <ShoppingBag size={14} />
          {toastMessage}
        </div>
      </div>

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
                <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest mt-1">Wishlist ({storeFavorites.length})</span>
              </div>
              <h1 className="sm:hidden text-xl font-black tracking-tight ml-2">Wishlist</h1>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <button onClick={() => router.push(`/store/${store.slug}/cart`)} className="p-3 rounded-full hover:scale-105 transition-transform relative" style={{ backgroundColor: `rgba(${textRgb}, 0.05)`, color: store.secondary_color }}>
                <ShoppingBag size={20} />
              </button>
              <button onClick={() => router.push(`/store/${store.slug}/wishlist`)} className="p-3 rounded-full hover:scale-105 transition-transform relative" style={{ backgroundColor: `rgba(${textRgb}, 0.05)`, color: store.secondary_color }}>
                <Heart size={20} />
                {storeFavorites.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg animate-bounce" style={{ backgroundColor: store.primary_color }}>{storeFavorites.length}</span>}
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
        {!session ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
            <Heart size={48} className="opacity-20" />
            <div>
              <h2 className="text-2xl font-black tracking-tight mb-2">Sign in to see your wishlist</h2>
              <p className="text-sm opacity-50 font-medium">Your saved items will appear here.</p>
            </div>
          </div>
        ) : storeFavorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
            <div
              className="w-24 h-24 rounded-[2rem] flex items-center justify-center border-2 border-dashed"
              style={{ borderColor: `rgba(${textRgb}, 0.15)` }}
            >
              <Heart size={36} className="opacity-20" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight mb-2">No saved items</h2>
              <p className="text-sm opacity-50 font-medium">Tap the heart icon on any product to save it here.</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {storeFavorites.map((fav: any) => (
              <div
                key={fav.productId}
                className="flex gap-4 p-4 rounded-2xl border shadow-sm relative"
                style={{ borderColor: `rgba(${textRgb}, 0.06)`, backgroundColor: `rgba(${textRgb}, 0.02)` }}
              >
                {/* Remove button */}
                <button
                  onClick={() => toggleFavorite({ id: fav.productId }, fav.type)}
                  className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center opacity-40 hover:opacity-100 hover:text-red-500 transition-all"
                  style={{ backgroundColor: `rgba(${textRgb}, 0.06)` }}
                >
                  <X size={12} />
                </button>

                {/* Image */}
                <div className="w-16 h-16 rounded-xl bg-black/5 overflow-hidden shrink-0 shadow-inner">
                  {fav.image
                    ? <img src={fav.image} className="w-full h-full object-cover" alt={fav.name} />
                    : <div className="w-full h-full flex items-center justify-center opacity-10"><ShoppingBag size={20} /></div>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-sm tracking-tight line-clamp-2 pr-6">{fav.name || 'Product'}</h3>
                  {fav.price && (
                    <p className="text-sm font-black mt-1" style={{ color: store.primary_color }}>
                      Br {parseFloat(fav.price).toFixed(2)}
                    </p>
                  )}
                  <button
                    onClick={() => handleAddToCart(fav)}
                    className="mt-3 w-full py-2 rounded-xl text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
                    style={{ backgroundColor: store.primary_color, color: store.background_color }}
                  >
                    <ShoppingBag size={12} /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-100%); } }
      ` }} />
    </main>
  )
}

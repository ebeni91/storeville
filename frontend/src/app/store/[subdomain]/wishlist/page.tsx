'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Heart, ShoppingBag, ArrowLeft, Loader2, X } from 'lucide-react'
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
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const { data: session } = authClient.useSession()
  const { favorites, fetchFavorites, toggleFavorite } = useFavoriteStore()
  const { addItem } = useCartStore()

  useEffect(() => { setIsMounted(true) }, [])

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await api.get(`/stores/discover/?slug=${subdomain}`)
        const list = res.data?.results || res.data || []
        if (list.length > 0) setStore(list[0])
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
    setTimeout(() => setToastMessage(null), 3000)
  }

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

      {/* Header */}
      <div
        className="sticky top-0 z-50 px-4 py-4 backdrop-blur-2xl border-b flex items-center gap-4"
        style={{ backgroundColor: `rgba(${bgRgb}, 0.9)`, borderColor: `rgba(${textRgb}, 0.08)` }}
      >
        <button
          onClick={() => router.push(`/store/${subdomain}`)}
          className="p-2.5 rounded-2xl bg-white/10 border border-white/20 hover:scale-105 transition-transform"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-black tracking-tight">Wishlist</h1>
          <p className="text-xs opacity-50 font-semibold">{favorites.length} saved item{favorites.length !== 1 ? 's' : ''}</p>
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
        ) : favorites.length === 0 ? (
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
            {favorites.map((fav) => (
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
    </main>
  )
}

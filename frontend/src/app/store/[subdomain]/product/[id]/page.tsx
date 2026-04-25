'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { api } from '@/lib/api'
import {
  Loader2, ShoppingBag, ArrowLeft, Heart, Star, Clock,
  Flame, Leaf, Plus, Minus, Check, X, ChevronRight, Package
} from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useFavoriteStore } from '@/store/favoriteStore'
import { useAuthStore } from '@/store/authStore'
import { authClient } from '@/lib/auth-client'
import { motion, AnimatePresence } from 'framer-motion'

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams()
  const subdomain = params.subdomain as string
  const productId = params.id as string

  const [store, setStore] = useState<any>(null)
  const [product, setProduct] = useState<any>(null)
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  // Option & Extra selections
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({}) // optionName → choice
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]) // extra IDs

  const { data: session } = authClient.useSession()
  const { addItem } = useCartStore()
  const { favorites, toggleFavorite } = useFavoriteStore()
  const { openAuthModal } = useAuthStore()

  useEffect(() => { setIsMounted(true) }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch store info first to identify type
        const storeRes = await api.get(`/stores/discovery/by_slug/?slug=${subdomain}`)
        const s = storeRes.data
        if (!s) { setIsLoading(false); return }
        setStore(s)

        // Fetch product based on store type
        const endpoint = s.store_type === 'FOOD'
          ? `/food/items/${productId}/?store_id=${s.id}`
          : `/retail/products/${productId}/?store_id=${s.id}`
        const prodRes = await api.get(endpoint)
        setProduct(prodRes.data)

        // Fetch recommended
        const recEndpoint = s.store_type === 'FOOD'
          ? `/food/items/?store_id=${s.id}`
          : `/retail/products/?store_id=${s.id}`
        const recRes = await api.get(recEndpoint)
        const allProducts = recRes.data?.results || recRes.data || []
        setRecommendedProducts(allProducts.filter((p: any) => String(p.id) !== String(productId)).slice(0, 10))
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    if (subdomain && productId) fetchData()
  }, [subdomain, productId])

  const hexToRgb = (hex: string) => {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#ffffff')
    return r ? `${parseInt(r[1], 16)}, ${parseInt(r[2], 16)}, ${parseInt(r[3], 16)}` : '255,255,255'
  }

  const bgRgb = store ? hexToRgb(store.background_color) : '255,255,255'
  const textRgb = store ? hexToRgb(store.secondary_color) : '0,0,0'

  // Parse options & extras safely
  const parsedOptions: any[] = (() => {
    if (!product?.options) return []
    try { return typeof product.options === 'string' ? JSON.parse(product.options) : (product.options || []) }
    catch { return [] }
  })()

  const parsedExtras: any[] = (() => {
    if (!product?.extras) return []
    try { return typeof product.extras === 'string' ? JSON.parse(product.extras) : (product.extras || []) }
    catch { return [] }
  })()

  // Dynamic total price
  const basePrice = parseFloat(product?.price || '0')
  const extrasTotal = selectedExtras.reduce((sum, extraId) => {
    const extra = parsedExtras.find((e: any) => e.id === extraId)
    return sum + parseFloat(extra?.price || '0')
  }, 0)
  const totalPrice = basePrice + extrasTotal

  const isFav = store && product ? favorites.some(f => f.productId === product.id && f.type === store.store_type) : false
  const isFood = store?.store_type === 'FOOD'

  // Check all required options are selected
  const missingRequired = parsedOptions
    .filter((opt: any) => opt.required && !selectedOptions[opt.name])
    .map((opt: any) => opt.name)

  const handleAddToCart = () => {
    if (!session) { openAuthModal(); return }
    if (missingRequired.length > 0) {
      alert(`Please select: ${missingRequired.join(', ')}`)
      return
    }

    const selectedOption = Object.keys(selectedOptions).length > 0
      ? { name: Object.keys(selectedOptions)[0], choice: Object.values(selectedOptions)[0] }
      : null

    const selectedExtrasDetails = selectedExtras.map(id => {
      const extra = parsedExtras.find((e: any) => e.id === id)
      return { id, name: extra?.name || '', price: extra?.price || '0' }
    })

    addItem(store.id, {
      id: product.id,
      name: product.name,
      price: totalPrice.toFixed(2), // Include extras in price
      quantity: 1,
      image: product.image || null,
      selectedOption,
      selectedExtras: selectedExtrasDetails,
    })

    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2500)
  }

  if (isLoading || !product || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-300" size={48} />
      </div>
    )
  }

  return (
    <main
      className="min-h-screen font-sans pb-36"
      style={{ backgroundColor: store.background_color || '#fafafa', color: store.secondary_color || '#111' }}
    >
      {/* ── HEADER ── */}
      <div
        className="sticky top-0 z-50 px-4 py-4 backdrop-blur-2xl border-b flex items-center justify-between"
        style={{ backgroundColor: `rgba(${bgRgb}, 0.9)`, borderColor: `rgba(${textRgb}, 0.08)` }}
      >
        <button
          onClick={() => router.back()}
          className="p-2.5 rounded-2xl bg-white/10 border border-white/20 hover:scale-105 transition-transform"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="font-black text-sm tracking-tight opacity-70 line-clamp-1 max-w-[200px]">{product.name}</span>
        <button
          onClick={() => {
            if (!session) { openAuthModal(); return }
            toggleFavorite(product, isFood ? 'FOOD' : 'RETAIL')
          }}
          className="p-2.5 rounded-2xl bg-white/10 border border-white/20 hover:scale-105 transition-transform"
          style={{ color: isFav ? '#ef4444' : 'inherit' }}
        >
          <Heart size={20} fill={isFav ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* ── PRODUCT IMAGE ── */}
      <div
        className="relative w-full aspect-[4/3] md:aspect-[16/7] bg-black/5 overflow-hidden"
      >
        {product.image ? (
          <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-10">
            {isFood ? <ShoppingBag size={64} /> : <Package size={64} />}
          </div>
        )}
        {/* Gradient overlay at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32"
          style={{ background: `linear-gradient(to top, ${store.background_color || '#fafafa'}, transparent)` }}
        />
      </div>

      {/* ── PRODUCT INFO ── */}
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-32">

        {/* Category + dietary tags */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {product.category_name && (
            <span
              className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border"
              style={{ borderColor: `rgba(${textRgb}, 0.15)`, color: store.secondary_color }}
            >
              {product.category_name}
            </span>
          )}
          {isFood && product.is_vegan && (
            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-green-100 text-green-700">
              <Leaf size={10} /> Vegan
            </span>
          )}
          {isFood && product.is_spicy && (
            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-red-100 text-red-700">
              <Flame size={10} /> Spicy
            </span>
          )}
          {!isFood && product.stock_quantity === 0 && (
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-red-100 text-red-700">Out of Stock</span>
          )}
          {!isFood && product.stock_quantity > 0 && product.stock_quantity <= 5 && (
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-100 text-amber-700">Only {product.stock_quantity} left</span>
          )}
        </div>

        <h1
          className="text-3xl md:text-4xl font-black tracking-tighter mb-3 leading-tight"
          style={{ fontFamily: `"${store.heading_font || 'Inter'}", sans-serif` }}
        >
          {product.name}
        </h1>

        {/* Meta row */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1 opacity-60">
            <Star size={13} className="fill-current" />
            <span className="text-xs font-bold">4.8</span>
          </div>
          {isFood && product.preparation_time_minutes > 0 && (
            <div className="flex items-center gap-1.5 opacity-60">
              <Clock size={13} />
              <span className="text-xs font-bold">{product.preparation_time_minutes} min</span>
            </div>
          )}
          {!isFood && product.sku && (
            <span className="text-xs font-mono font-bold opacity-40">SKU: {product.sku}</span>
          )}
        </div>

        {product.description && (
          <p className="text-sm md:text-base opacity-70 font-medium leading-relaxed mb-6">{product.description}</p>
        )}

        {/* ── OPTIONS (Food & Retail) ── */}
        {parsedOptions.length > 0 && (
          <div className="mb-6">
            {parsedOptions.map((opt: any) => (
              <div key={opt.name} className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-black text-sm tracking-tight">{opt.name}</h3>
                  {opt.required
                    ? <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-red-100 text-red-600">Required</span>
                    : <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded opacity-40" style={{ backgroundColor: `rgba(${textRgb}, 0.06)` }}>Optional</span>
                  }
                </div>
                <div className="flex flex-wrap gap-2">
                  {opt.choices.map((choice: string) => {
                    const isSelected = selectedOptions[opt.name] === choice
                    return (
                      <button
                        key={choice}
                        onClick={() => setSelectedOptions(prev => ({ ...prev, [opt.name]: choice }))}
                        className="px-5 py-2.5 rounded-full font-black text-sm tracking-wide transition-all hover:scale-105"
                        style={{
                          backgroundColor: isSelected ? store.primary_color : `rgba(${textRgb}, 0.06)`,
                          color: isSelected ? store.background_color : store.secondary_color,
                          border: `2px solid ${isSelected ? store.primary_color : 'transparent'}`
                        }}
                      >
                        {choice}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── EXTRAS (Food only, but shown for retail if present) ── */}
        {parsedExtras.length > 0 && (
          <div className="mb-6">
            <h3 className="font-black text-sm tracking-tight mb-3">
              {isFood ? 'Add-ons & Extras' : 'Extras'}
              <span className="ml-2 text-[9px] font-bold uppercase tracking-widest opacity-40">Optional</span>
            </h3>
            <div className="flex flex-col gap-2">
              {parsedExtras.map((extra: any) => {
                const isChecked = selectedExtras.includes(extra.id)
                return (
                  <button
                    key={extra.id}
                    onClick={() => setSelectedExtras(prev =>
                      isChecked ? prev.filter(id => id !== extra.id) : [...prev, extra.id]
                    )}
                    className="flex items-center justify-between p-4 rounded-2xl border text-left transition-all"
                    style={{
                      borderColor: isChecked ? store.primary_color : `rgba(${textRgb}, 0.08)`,
                      backgroundColor: isChecked ? `rgba(${hexToRgb(store.primary_color)}, 0.06)` : `rgba(${textRgb}, 0.02)`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center transition-all"
                        style={{
                          backgroundColor: isChecked ? store.primary_color : 'transparent',
                          border: `2px solid ${isChecked ? store.primary_color : `rgba(${textRgb}, 0.2)`}`
                        }}
                      >
                        {isChecked && <Check size={12} color={store.background_color} />}
                      </div>
                      <span className="font-bold text-sm">{extra.name}</span>
                    </div>
                    <span className="font-black text-sm" style={{ color: store.primary_color }}>
                      +Br {parseFloat(extra.price).toFixed(2)}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
        
        {/* ── RECOMMENDED PRODUCTS ── */}
        {recommendedProducts.length > 0 && (
          <div className="mt-12 mb-6 border-t pt-8" style={{ borderColor: `rgba(${textRgb}, 0.08)` }}>
            <h3 className="font-black text-xl tracking-tight mb-4">More from this store</h3>
            <div className="flex overflow-x-auto gap-4 pb-4 snap-x [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
              {recommendedProducts.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => router.push(`/store/${subdomain}/product/${p.id}`)}
                  className="min-w-[160px] md:min-w-[200px] cursor-pointer snap-start rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group border"
                  style={{ borderColor: `rgba(${textRgb}, 0.08)`, backgroundColor: `rgba(${textRgb}, 0.02)` }}
                >
                  <div className="w-full aspect-[4/5] bg-black/5 overflow-hidden">
                    {p.image ? <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center opacity-10"><ShoppingBag size={32} /></div>}
                  </div>
                  <div className="p-3 bg-white/40 backdrop-blur-sm" style={{ backgroundColor: `rgba(${bgRgb}, 0.6)` }}>
                    <h4 className="font-bold text-sm tracking-tight line-clamp-1 mb-1">{p.name}</h4>
                    <p className="font-black text-sm" style={{ color: store.primary_color }}>Br {parseFloat(p.price).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── STICKY BOTTOM BAR ── */}
      <div
        className="fixed bottom-0 inset-x-0 z-50 px-4 py-4 backdrop-blur-2xl border-t"
        style={{ backgroundColor: `rgba(${bgRgb}, 0.95)`, borderColor: `rgba(${textRgb}, 0.08)` }}
      >
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          {/* Price */}
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Total</span>
            <span className="text-2xl font-black tracking-tighter" style={{ color: store.primary_color }}>
              Br {totalPrice.toFixed(2)}
            </span>
          </div>

          {/* Add to Cart */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleAddToCart}
            disabled={!isFood && product.stock_quantity === 0}
            className="flex-1 py-4 rounded-2xl font-black tracking-widest uppercase text-sm shadow-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50"
            style={{ backgroundColor: addedToCart ? '#22c55e' : store.primary_color, color: store.background_color }}
          >
            <AnimatePresence mode="wait">
              {addedToCart ? (
                <motion.span key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-2">
                  <Check size={18} /> Added to Cart!
                </motion.span>
              ) : (
                <motion.span key="add" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-2">
                  <ShoppingBag size={18} />
                  {(!isFood && product.stock_quantity === 0) ? 'Out of Stock' : 'Add to Cart'}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Go to cart shortcut if added */}
          {addedToCart && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => router.push(`/store/${subdomain}/cart`)}
              className="p-4 rounded-2xl border font-black text-sm transition-all hover:scale-105"
              style={{ borderColor: `rgba(${textRgb}, 0.15)` }}
            >
              <ChevronRight size={20} />
            </motion.button>
          )}
        </div>
      </div>
    </main>
  )
}

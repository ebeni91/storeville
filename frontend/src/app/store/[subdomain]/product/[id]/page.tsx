'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Loader2, ArrowLeft, Heart, Search, ShoppingBag, Plus, Minus, Check, Chrome, Lock, User, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { authClient } from '@/lib/auth-client'
import { useCartStore } from '@/store/cartStore'
import { useFavoriteStore } from '@/store/favoriteStore'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const subdomain = params.subdomain as string
  const productId = params.id as string

  // Global States
  const { data: session } = authClient.useSession()
  const { isAuthModalOpen, openAuthModal, closeAuthModal } = useAuthStore()
  const { carts, addItem } = useCartStore()
  const { favorites, toggleFavorite, fetchFavorites } = useFavoriteStore()

  // Local States
  const [store, setStore] = useState<any>(null)
  const [product, setProduct] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Options & Selections
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [selectedExtras, setSelectedExtras] = useState<any[]>([])
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (session) fetchFavorites()
  }, [session, fetchFavorites])

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setIsLoading(true)
        // 1. Get Store Theme/Info
        const storeRes = await api.get(`/stores/discovery/by_slug/?slug=${subdomain}`)
        const storeData = storeRes.data
        setStore(storeData)

        // 2. Get Product Info
        const endpoint = storeData.store_type === 'FOOD' ? `/food/items/${productId}/` : `/retail/products/${productId}/`
        const prodRes = await api.get(endpoint)
        
        // Ensure options and extras are parsed if they come as string
        let prod = prodRes.data
        if (typeof prod.options === 'string') {
          try { prod.options = JSON.parse(prod.options) } catch (e) { prod.options = [] }
        }
        if (typeof prod.extras === 'string') {
          try { prod.extras = JSON.parse(prod.extras) } catch (e) { prod.extras = [] }
        }
        
        setProduct(prod)

        // Initialize required options
        const initialOpts: Record<string, string> = {}
        if (prod.options && Array.isArray(prod.options)) {
          prod.options.forEach((opt: any) => {
             if (opt.required && opt.choices && opt.choices.length > 0) {
               initialOpts[opt.name] = opt.choices[0] // default to first
             }
          })
        }
        setSelectedOptions(initialOpts)
        
      } catch (err) {
        console.error("Product Error:", err)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (subdomain && productId) fetchPageData()
  }, [subdomain, productId])

  if (isLoading || !store) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" size={40}/></div>
  if (!product) return <div className="min-h-screen flex items-center justify-center font-bold">Product not found.</div>

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#ffffff')
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255'
  }

  const bgRgb = hexToRgb(store.background_color)
  const textRgb = hexToRgb(store.secondary_color)
  
  const optionsList = Array.isArray(product.options) ? product.options : []
  const extrasList = Array.isArray(product.extras) ? product.extras : []

  const toggleExtra = (extra: any) => {
    if (selectedExtras.find(e => e.id === extra.id)) {
      setSelectedExtras(selectedExtras.filter(e => e.id !== extra.id))
    } else {
      setSelectedExtras([...selectedExtras, extra])
    }
  }

  const basePrice = parseFloat(product.price) || 0
  const extrasTotal = selectedExtras.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0)
  const unitPrice = basePrice + extrasTotal
  const finalPrice = unitPrice * quantity

  const areRequiredOptionsSelected = () => {
    return optionsList.every((opt: any) => {
      if (opt.required && !selectedOptions[opt.name]) return false
      return true
    })
  }

  const handleAddToCart = () => {
    if (!areRequiredOptionsSelected()) {
      alert("Please select all required options.")
      return
    }

    // Build special requests string strictly for UI/Checkout readability
    const optsString = Object.entries(selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ')
    const extsString = selectedExtras.map(e => `+${e.name}`).join(', ')
    const combinedRequests = [optsString, extsString].filter(Boolean).join(' | ')

    addItem(store.id, { 
      ...product, 
      price: unitPrice.toString(), // The cart handles quantity multiplier
      quantity,
      special_requests: combinedRequests 
    })

    setToastMessage(`Added to order!`)
    setTimeout(() => {
      setToastMessage(null)
      router.push(`/store/${subdomain}`)
    }, 1500)
  }

  const isFav = favorites.some(f => f.productId === product.id)

  return (
    <main className="min-h-screen font-sans" style={{ backgroundColor: store.background_color || '#fafafa', color: store.secondary_color || '#111827' }}>
      
      {/* TOAST */}
      <div className={`fixed top-12 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 pointer-events-none ${toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
        <div className="backdrop-blur-xl px-8 py-4 rounded-full flex items-center gap-3 shadow-2xl border" style={{ backgroundColor: store.primary_color, color: store.background_color, borderColor: `rgba(${textRgb}, 0.1)` }}>
          <Check size={20} />
          <span className="text-sm font-black tracking-wide uppercase">{toastMessage}</span>
        </div>
      </div>

      {/* TOP NAV */}
      <nav className="sticky top-0 z-50 backdrop-blur-2xl border-b p-4 shadow-sm" style={{ borderColor: `rgba(${textRgb}, 0.1)`, backgroundColor: `rgba(${bgRgb}, 0.85)` }}>
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <button onClick={() => router.push(`/store/${subdomain}`)} className="flex items-center gap-2 font-bold text-sm hover:opacity-70 transition-opacity p-2">
            <ArrowLeft size={20} /> <span className="hidden md:inline">Back</span>
          </button>
          <div className="font-black text-lg tracking-tight">{store.name}</div>
          <div className="flex items-center gap-4">
            <button onClick={() => { if(!session) return openAuthModal(); toggleFavorite(product, store.store_type); }} className="hover:scale-110 transition-transform p-2">
              <Heart size={20} className={isFav ? "fill-red-500 text-red-500" : ""} />
            </button>
            <div className="relative cursor-pointer" onClick={() => router.push(`/store/${subdomain}`)}>
              <ShoppingBag size={20} />
              {(carts[store.id] || []).length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-bold" style={{ backgroundColor: store.primary_color, color: store.background_color }}>
                  {(carts[store.id] || []).reduce((acc: number, curr: any) => acc + curr.quantity, 0)}
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="max-w-[1200px] mx-auto p-4 md:p-8 lg:p-12">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-16 items-start">
          
          {/* IMAGE */}
          <div className="w-full md:w-1/2 sticky top-24">
             <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-black/5 shadow-inner border" style={{ borderColor: `rgba(${textRgb}, 0.05)` }}>
                {product.image ? (
                  <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-10"><ShoppingBag size={80}/></div>
                )}
             </div>
          </div>

          {/* DETAILS */}
          <div className="w-full md:w-1/2 pb-32">
             {product.category_name && (
                <span className="text-[10px] font-black tracking-widest uppercase px-3 py-1.5 border rounded-md shadow-sm mb-4 inline-block" style={{ borderColor: `rgba(${textRgb}, 0.2)` }}>
                  {product.category_name}
                </span>
             )}
             <h1 className="text-4xl lg:text-5xl font-black mb-4 tracking-tighter leading-none" style={{ fontFamily: `"${store.heading_font || 'Inter'}", sans-serif` }}>{product.name}</h1>
             <p className="text-3xl font-black mb-6" style={{ color: store.primary_color }}>Br {basePrice.toFixed(2)}</p>
             <p className="text-sm font-medium opacity-70 mb-10 leading-relaxed max-w-lg">{product.description}</p>

             {/* VARIANTS & OPTIONS */}
             {optionsList.length > 0 && (
               <div className="space-y-8 mb-10">
                 {optionsList.map((opt: any) => (
                   <div key={opt.id}>
                     <h3 className="font-black text-sm mb-3 flex items-center gap-2">
                       {opt.name}
                       {opt.required && <span className="text-[10px] bg-black/10 px-2 py-0.5 rounded tracking-widest uppercase border" style={{ borderColor: `rgba(${textRgb}, 0.2)` }}>Required</span>}
                     </h3>
                     <div className="flex flex-wrap gap-3">
                       {opt.choices.map((choice: string) => {
                         const isSelected = selectedOptions[opt.name] === choice
                         return (
                           <button 
                             key={choice} 
                             onClick={() => setSelectedOptions({...selectedOptions, [opt.name]: choice})}
                             className="px-5 py-3 rounded-xl text-sm font-bold border transition-all hover:-translate-y-0.5 shadow-sm"
                             style={{ 
                               backgroundColor: isSelected ? store.primary_color : 'transparent',
                               color: isSelected ? store.background_color : store.secondary_color,
                               borderColor: isSelected ? store.primary_color : `rgba(${textRgb}, 0.2)`
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

             {/* EXTRAS */}
             {extrasList.length > 0 && (
               <div className="space-y-4 mb-10 pt-8 border-t" style={{ borderColor: `rgba(${textRgb}, 0.1)` }}>
                 <h3 className="font-black text-sm mb-4">Add-ons</h3>
                 <div className="space-y-3">
                   {extrasList.map((extra: any) => {
                     const isSelected = selectedExtras.find(e => e.id === extra.id)
                     return (
                       <div key={extra.id} onClick={() => toggleExtra(extra)} className="flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:bg-black/5 transition-colors shadow-sm" style={{ borderColor: `rgba(${textRgb}, 0.1)` }}>
                         <div className="flex items-center gap-4">
                           <div className="w-5 h-5 rounded border flex items-center justify-center transition-colors" style={{ backgroundColor: isSelected ? store.primary_color : 'transparent', borderColor: isSelected ? store.primary_color : `rgba(${textRgb}, 0.3)` }}>
                             {isSelected && <Check size={14} color={store.background_color} />}
                           </div>
                           <span className="text-sm font-bold">{extra.name}</span>
                         </div>
                         <span className="text-sm font-black" style={{ color: store.primary_color }}>+Br {parseFloat(extra.price).toFixed(2)}</span>
                       </div>
                     )
                   })}
                 </div>
               </div>
             )}

             {/* ACTION BAR */}
             <div className="mt-12 pt-8 border-t space-y-6" style={{ borderColor: `rgba(${textRgb}, 0.1)` }}>
                <div className="flex items-center justify-between">
                   <span className="font-black tracking-tight text-xl">Quantity</span>
                   <div className="flex items-center gap-4 border p-1 rounded-full shadow-inner" style={{ borderColor: `rgba(${textRgb}, 0.2)` }}>
                     <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-black/10 rounded-full transition-colors"><Minus size={18}/></button>
                     <span className="font-black w-6 text-center">{quantity}</span>
                     <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-black/10 rounded-full transition-colors"><Plus size={18}/></button>
                   </div>
                </div>

                <button 
                  onClick={handleAddToCart}
                  className="w-full py-5 rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex justify-between px-8"
                  style={{ backgroundColor: store.primary_color, color: store.background_color }}
                >
                  <span>Add To Order</span>
                  <span>Br {finalPrice.toFixed(2)}</span>
                </button>
             </div>

          </div>
        </div>
      </div>
    </main>
  )
}

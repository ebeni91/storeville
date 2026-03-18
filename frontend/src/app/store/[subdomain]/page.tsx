'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Loader2, ShoppingBag, MapPin } from 'lucide-react'

interface StoreData {
  name: string; description: string; logo: string | null; banner: string | null; city: string;
  theme: string; primary_color: string; secondary_color: string; background_color: string;
  heading_font: string; card_style: string; announcement_is_active: boolean;
  announcement_text: string; announcement_color: string; social_instagram: string;
}

interface Product { id: number; name: string; description: string; price: string; image: string | null; category_name: string | null; }

export default function StorefrontPage({ params }: { params: { subdomain: string } }) {
  const [store, setStore] = useState<StoreData | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStorefront = async () => {
      try {
        const storeRes = await api.get(`/stores/discovery/${params.subdomain}/`)
        setStore(storeRes.data)
        const prodRes = await api.get(`/products/storefront/?store=${params.subdomain}`)
        setProducts(Array.isArray(prodRes.data) ? prodRes.data : prodRes.data.results || [])
      } catch (err) { console.error("Failed to load", err) } 
      finally { setIsLoading(false) }
    }
    fetchStorefront()
  }, [params.subdomain])

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-gray-400" size={48} /></div>
  if (!store) return <div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl font-bold opacity-50">Store Not Found</h1></div>

  // --- DYNAMIC ENGINE ---
  const themeStyles = { backgroundColor: store.background_color, color: store.secondary_color, fontFamily: `"${store.heading_font}", sans-serif` }
  const btnStyle = { backgroundColor: store.primary_color, color: store.background_color }

  let cardClass = ""
  let cardStyle = {}
  if (store.card_style === 'luxury-glass') {
    cardClass = "rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.15)] border backdrop-blur-md"
    cardStyle = { backgroundColor: `${store.secondary_color}03`, borderColor: `${store.secondary_color}15` }
  } else if (store.card_style === 'minimal-border') {
    cardClass = "rounded-none border-b hover:-translate-y-2"
    cardStyle = { backgroundColor: 'transparent', borderColor: `${store.secondary_color}30` }
  } else {
    cardClass = "rounded-2xl border-2 hover:-translate-y-1 hover:shadow-xl"
    cardStyle = { backgroundColor: store.background_color, borderColor: store.secondary_color }
  }

  return (
    <main className="min-h-screen pb-24 transition-colors duration-700 font-sans" style={themeStyles}>
      
      {/* GLOBAL ANIMATION STYLES */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee { 0% { transform: translateX(100vw); } 100% { transform: translateX(-100%); } }
        .marquee-container { width: 100%; overflow: hidden; position: relative; white-space: nowrap; }
        .marquee-content { display: inline-block; animation: marquee 25s linear infinite; }
        .marquee-content:hover { animation-play-state: paused; }
      `}} />

      {/* 🚀 EXTRAORDINARY MARQUEE ANNOUNCEMENT BAR */}
      {store.announcement_is_active && store.announcement_text && (
        <div className="marquee-container py-3 shadow-md z-50 sticky top-0" style={{ backgroundColor: store.announcement_color, color: store.background_color }}>
          <div className="marquee-content text-xs sm:text-sm font-black tracking-[0.2em] uppercase">
            {store.announcement_text} &nbsp;&nbsp;&nbsp;&nbsp;✦&nbsp;&nbsp;&nbsp;&nbsp; {store.announcement_text} &nbsp;&nbsp;&nbsp;&nbsp;✦&nbsp;&nbsp;&nbsp;&nbsp; {store.announcement_text}
          </div>
        </div>
      )}

      {/* LUXURY HEADER */}
      <div className="relative">
        <div className="w-full h-72 sm:h-96 overflow-hidden relative">
          {store.banner ? (
            <img src={store.banner} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 opacity-10" style={{ backgroundColor: store.primary_color }}></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative -mt-24 sm:-mt-32 z-10">
          <div className="flex flex-col items-center text-center">
            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full border-[6px] shadow-2xl overflow-hidden flex items-center justify-center mb-6 transition-transform hover:scale-105 duration-500" style={{ borderColor: store.background_color, backgroundColor: store.background_color }}>
               {store.logo ? <img src={store.logo} alt="Logo" className="w-full h-full object-cover" /> : <ShoppingBag size={56} style={{ color: store.primary_color }} />}
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-black tracking-tighter mb-4">{store.name}</h1>
            <p className="flex items-center gap-2 font-bold tracking-widest uppercase text-sm opacity-60 mb-8"><MapPin size={16} /> {store.city}</p>
            {store.description && <p className="max-w-2xl text-lg sm:text-xl opacity-80 leading-relaxed font-medium">{store.description}</p>}
          </div>
        </div>
      </div>

      {/* PREMIUM PRODUCT GRID */}
      <div className="max-w-7xl mx-auto px-6 mt-24">
        <div className="flex items-end justify-between mb-12 border-b-2 pb-6" style={{ borderColor: `${store.secondary_color}20` }}>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Curated Collection</h2>
          <span className="font-bold tracking-widest uppercase text-sm opacity-50">{products.length} Items</span>
        </div>

        {products.length === 0 ? (
           <div className="text-center py-32 opacity-50"><ShoppingBag size={64} className="mx-auto mb-6" /><h3 className="text-2xl font-black tracking-widest uppercase">Collection Empty</h3></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
            {products.map(product => (
              <div key={product.id} className={`group transition-all duration-500 flex flex-col overflow-hidden ${cardClass}`} style={cardStyle}>
                
                <div className="aspect-[4/5] relative overflow-hidden bg-black/5">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-20"><ShoppingBag size={48} /></div>
                  )}
                  {product.category_name && (
                    <div className="absolute top-4 left-4 px-3 py-1.5 backdrop-blur-md bg-white/80 rounded-sm text-[10px] font-black uppercase tracking-widest text-black shadow-lg">
                      {product.category_name}
                    </div>
                  )}
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-black text-xl mb-2 line-clamp-1 tracking-tight">{product.name}</h3>
                  <p className="text-sm opacity-60 line-clamp-2 mb-8 font-medium leading-relaxed flex-1">{product.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-black text-2xl tracking-tighter">Br {product.price}</span>
                    <button className="px-6 py-3 font-black text-sm tracking-widest uppercase hover:opacity-90 transition-opacity hover:scale-105 duration-300 rounded-sm" style={btnStyle}>
                      Add To Cart
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
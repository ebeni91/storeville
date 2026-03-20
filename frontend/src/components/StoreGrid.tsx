'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchNearbyStores, Store } from '@/lib/api'
import { Store as StoreIcon, MapPin, ArrowRight, Clock, Star, Navigation } from 'lucide-react'
import Link from 'next/link'

export default function StoreGrid({ mode = 'retail' }: { mode: 'retail' | 'food' }) {
  const { data: stores, isLoading } = useQuery({
    queryKey: ['stores_grid', 8.9806, 38.7578, mode],
    queryFn: () => fetchNearbyStores(8.9806, 38.7578, 15, mode),
  })

  // Accent colors driven by mode toggle
  const modeColor = mode === 'food' ? 'text-orange-500' : 'text-indigo-600'
  const modeBg = mode === 'food' ? 'bg-orange-500' : 'bg-indigo-600'
  const modeHover = mode === 'food' ? 'group-hover:text-orange-500' : 'group-hover:text-indigo-600'
  const modeRing = mode === 'food' ? 'group-hover:ring-orange-500/50' : 'group-hover:ring-indigo-600/50'

  // 🦴 PREMIUM SKELETON LOADER
  if (isLoading) {
    return (
      <div className="w-full h-full p-4 md:p-8 overflow-y-auto bg-gray-50/30 hide-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white/80 backdrop-blur-sm border border-white shadow-sm p-4 md:p-5 rounded-[2rem] flex flex-col h-[360px]">
              <div className="w-full h-44 bg-gray-200/60 animate-pulse rounded-2xl mb-5"></div>
              <div className="h-6 bg-gray-200/60 animate-pulse rounded-lg w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200/60 animate-pulse rounded-lg w-1/2 mb-auto"></div>
              <div className="pt-5 border-t border-gray-100 flex justify-between items-center mt-4">
                <div className="h-4 bg-gray-200/60 animate-pulse rounded w-1/3"></div>
                <div className="w-10 h-10 rounded-full bg-gray-200/60 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 📭 EMPTY STATE
  if (!stores || stores.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50/30">
        <div className="w-24 h-24 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center mb-6">
          <StoreIcon size={40} className="text-gray-300" />
        </div>
        <p className="font-black text-2xl tracking-tight text-gray-900 mb-2">No places found.</p>
        <p className="text-base font-medium text-gray-500">Try zooming out or switching modes.</p>
      </div>
    )
  }

  // 🏬 LIVE GRID (Clean product/store cards)
  return (
    <div className="w-full h-full p-4 md:p-8 overflow-y-auto bg-gray-50/30 hide-scrollbar">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {stores.map((store: Store) => (
         <Link 
            key={store.id} 
            // 🌟 CHANGED from store.subdomain to store.slug
            href={`http://${store.slug}.localhost:3000`} 
            className={`group bg-white/90 backdrop-blur-xl border border-white shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 transform hover:-translate-y-2 p-4 md:p-5 rounded-[2rem] flex flex-col relative ring-1 ring-transparent ${modeRing}`}
          >
            {/* Thumbnail Header */}
            <div className="w-full h-44 bg-gray-100 rounded-2xl mb-5 overflow-hidden relative border border-gray-100/50">
              {store.logo ? (
                <img src={store.logo} alt={store.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                  <StoreIcon size={48} />
                </div>
              )}
              
              {/* Category Badge */}
              {store.category && (
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm text-gray-900 border border-white/50">
                  {store.category}
                </div>
              )}
              
              {/* Rating */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl text-[10px] font-bold shadow-sm text-gray-900 flex items-center gap-1 border border-white/50">
                <Star size={12} className="fill-yellow-400 text-yellow-400" /> 4.9
              </div>

              {/* 🚀 LIVE AVAILABILITY INDICATORS */}
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-[0_4px_10px_rgba(0,0,0,0.1)] text-gray-900 flex items-center gap-2 border border-white/50">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div> Open
              </div>
              <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl text-[10px] font-bold shadow-sm text-gray-700 flex items-center gap-1.5 border border-white/50">
                <Clock size={12} /> 15-25m
              </div>
            </div>

            {/* Typography & Hierarchy */}
            <h3 className={`text-xl font-black text-gray-900 line-clamp-1 tracking-tight transition-colors duration-300 ${modeHover}`}>
              {store.name}
            </h3>
            
            <div className="flex items-center justify-between mt-1.5 mb-5">
              <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                <MapPin size={14} className="shrink-0" /> {store.city || "Addis Ababa"}
              </p>
              <p className="text-xs font-bold text-gray-400 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                <Navigation size={10} /> {(store.distance || 2.5).toFixed(1)} km
              </p>
            </div>

            {/* Premium Action Footer */}
            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className={`text-[11px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-900 transition-colors duration-300`}>
                Enter Store
              </span>
              <div className={`w-10 h-10 rounded-full ${modeBg} text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-all duration-300`}>
                <ArrowRight size={16} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
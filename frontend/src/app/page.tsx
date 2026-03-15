'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Store as StoreIcon, Truck, Coffee, ShoppingBag, LayoutGrid, Map as MapIcon, MessageCircle } from 'lucide-react'

// Dynamically import the map so Leaflet doesn't crash Next.js SSR
const MapExplorer = dynamic(() => import('@/components/MapExplorer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-[2.5rem]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mb-4"></div>
      <p className="text-indigo-600 font-bold animate-pulse">Initializing Maps...</p>
    </div>
  )
})

export default function Home() {
  const [mode, setMode] = useState<'retail' | 'food'>('retail')
  const [viewMode, setViewMode] = useState<'map' | 'grid'>('map')

  return (
    <main className="min-h-screen relative font-sans text-gray-900 overflow-x-hidden pb-20">
      
      {/* 1. The Global Background */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-[#e6e9ff] via-[#f5e6ff] to-[#e6fcff]">
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808022_1px,transparent_1px),linear-gradient(to_bottom,#80808022_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* 2. Top Navbar - UPDATED WITH LINKS */}
      <header className="relative z-20 px-6 py-5 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 text-indigo-600">
          <StoreIcon size={28} className="fill-indigo-100" />
          <span className="text-2xl font-extrabold tracking-tight text-indigo-700">StoreVille</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <button className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
            <Truck size={18} /> Track Order
          </button>
          <div className="w-px h-5 bg-gray-300"></div>
          
          {/* Linked to Login Page */}
          <Link href="/login" className="flex items-center gap-2 font-bold hover:text-indigo-600 transition-colors">
             Log In
          </Link>
          
          {/* Linked to Registration Page */}
          <Link href="/register" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5">
            Open Your Store
          </Link>
        </nav>
      </header>

      {/* 3. The Content Area */}
      <div className="relative z-10 flex flex-col items-center pt-8 px-4">
        
        {/* The Hero Section */}
        <div className="max-w-5xl mx-auto text-center animate-in fade-in slide-in-from-bottom-8 duration-700 w-full mt-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 backdrop-blur-sm border border-white/60 shadow-sm text-xs font-bold text-indigo-600 tracking-widest uppercase mb-6">
            ✨ The Digital Mall of Ethiopia
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.1] mb-6 tracking-tight">
            Everything you need, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-400">
              delivered instantly.
            </span>
          </h1>

          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto font-medium">
            Discover hyper-local stores, cafes, and businesses right in your exact physical vicinity. What are you looking for today?
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={() => setMode('food')}
              className={`flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-lg shadow-md transition-all transform hover:-translate-y-1 ${
                mode === 'food' 
                  ? 'bg-orange-500 text-white shadow-orange-300 ring-4 ring-orange-100' 
                  : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 shadow-gray-200'
              }`}
            >
              <Coffee size={24} /> Order Food & Coffee
            </button>

            <button 
              onClick={() => setMode('retail')}
              className={`flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-lg shadow-md transition-all transform hover:-translate-y-1 ${
                mode === 'retail' 
                  ? 'bg-indigo-600 text-white shadow-indigo-300 ring-4 ring-indigo-100' 
                  : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 shadow-gray-200'
              }`}
            >
              <ShoppingBag size={24} /> Shop Retail
            </button>
          </div>
        </div>

        {/* The Map View */}
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center animate-in fade-in zoom-in-95 duration-500 delay-150">
          <div className="w-full flex justify-end mb-4 px-2">
            <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-white flex items-center gap-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl flex items-center justify-center transition-all ${viewMode === 'grid' ? 'bg-white shadow-md text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-xl flex items-center justify-center transition-all ${viewMode === 'map' ? 'bg-white shadow-md text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <MapIcon size={18} />
              </button>
            </div>
          </div>

          <div className="w-full h-[65vh] min-h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/80 relative bg-white transition-all duration-500">
            {viewMode === 'map' ? (
              <MapExplorer mode={mode} />
            ) : (
              <div className="w-full h-full flex items-center justify-center flex-col text-gray-500 bg-gray-50/50">
                 <LayoutGrid size={48} className="mb-4 text-gray-300" />
                 <p className="font-medium text-lg">Grid View Coming Soon</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <button className="fixed bottom-8 right-8 z-50 bg-indigo-600 text-white p-4 rounded-full shadow-lg shadow-indigo-300 hover:bg-indigo-700 transition-transform hover:scale-110">
        <MessageCircle size={28} />
      </button>
    </main>
  )
}
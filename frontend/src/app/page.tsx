'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Store as StoreIcon, Truck, Coffee, ShoppingBag, LayoutGrid, Map as MapIcon, MessageCircle, ArrowRight, Instagram, Twitter, Facebook, User, LogOut } from 'lucide-react'
import StoreGrid from '@/components/StoreGrid'
import MapExplorer from '@/components/MapExplorer' 
import ProfileDropdown from '@/components/ProfileDropdown'
import { api } from '@/lib/api'

export default function Home() {
  const router = useRouter()
  const { token, logout } = useAuthStore()
  const [isMounted, setIsMounted] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  
  const [mode, setMode] = useState<'retail' | 'food' | null>(null)
  const [viewMode, setViewMode] = useState<'map' | 'grid'>('map')
  const [isScrolled, setIsScrolled] = useState(false)

  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20)
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])
  // The clean, extracted logout function
  const handleSignOut = async () => {
    try {
      await api.post('/accounts/logout/')
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      logout()
      setIsUserMenuOpen(false) // Close the dropdown menu
      window.location.reload() // Hard reload to clear all guest states cleanly
    }
  }
  return (
    <main className="min-h-screen relative font-sans text-gray-900 overflow-x-hidden selection:bg-indigo-500 selection:text-white flex flex-col">
      
      {/* 🎨 BACKGROUND SYSTEM */}
      <div className="fixed inset-0 z-0 bg-[length:200%_200%] animate-[gradient_15s_ease_infinite] bg-gradient-to-br from-[#eef2ff] via-[#f3e8ff] to-[#cffafe]">
        <div className="absolute inset-0 opacity-[0.25] mix-blend-overlay bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]"></div>
      </div>

      {/* 🧭 NAVIGATION BAR */}
      <div className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-4 md:pt-6 pointer-events-none">
        <motion.header 
          initial={false}
          animate={{
            backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.7)' : 'transparent',
            boxShadow: isScrolled ? '0 8px 30px rgba(0,0,0,0.04)' : 'none',
            borderColor: isScrolled ? 'rgba(255, 255, 255, 0.5)' : 'transparent',
            paddingTop: isScrolled ? '1rem' : '1.25rem',
            paddingBottom: isScrolled ? '1rem' : '1.25rem',
            paddingLeft: isScrolled ? '2rem' : '1rem',
            paddingRight: isScrolled ? '2rem' : '1rem',
            borderRadius: isScrolled ? '9999px' : '0px'
          }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`pointer-events-auto flex items-center justify-between w-full max-w-[1400px] border ${isScrolled ? 'backdrop-blur-2xl' : ''}`}
        >
          
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-[0_4px_20px_rgba(79,70,229,0.4)] group-hover:scale-105 transition-transform duration-300">
              <StoreIcon size={22} className="text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-gray-900">Store<span className="text-indigo-600">Ville</span></span>
          </Link>

          {/* Right: Actions */}
          <nav className="flex items-center gap-6 md:gap-8 text-sm font-bold text-gray-600">
            <button className="hidden md:flex items-center gap-2 hover:text-indigo-600 transition-colors">
              <Truck size={18} /> Track Order
            </button>
            <div className="hidden md:block w-px h-5 bg-gray-300"></div>
            
            <div className="flex items-center gap-4">
              {isMounted && token ? (
                /* 🌟 LOGGED IN: SHOW UNIVERSAL PROFILE DROPDOWN */
                <div className="relative">
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} 
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 hover:shadow-md transition-all"
                  >
                    <User size={20} className="text-indigo-600" />
                  </button>
                  
                  <ProfileDropdown 
                    isOpen={isUserMenuOpen} 
                    onClose={() => setIsUserMenuOpen(false)} 
                    onSignOut={handleSignOut} 
                  />
                </div>
              ) : (
                /* 🌟 LOGGED OUT: SHOW DEFAULT BUTTONS */
                <>
                  <Link href="/login" className="hover:text-indigo-600 transition-colors hidden sm:block">
                     Log In
                  </Link>
                  <Link href="/register" className="bg-gray-900 text-white px-7 py-3.5 rounded-full shadow-[0_8px_20px_rgb(0,0,0,0.12)] hover:bg-black hover:shadow-[0_8px_25px_rgb(0,0,0,0.2)] transition-all duration-300 transform hover:-translate-y-0.5 tracking-wide">
                    Open Your Store
                  </Link>
                </>
              )}
            </div>
          </nav>
        </motion.header>
      </div>

      {/* ⚡ HERO & EXPLORER SECTION */}
      <div className={`relative z-10 flex flex-col items-center px-4 w-full max-w-[1600px] mx-auto transition-all duration-1000 ease-out flex-1 ${mode ? 'pt-32 md:pt-36' : 'pt-[25vh]'}`}>
        
        <div className="max-w-4xl mx-auto text-center w-full mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/50 backdrop-blur-xl border border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-[10px] md:text-xs font-black text-indigo-700 tracking-widest uppercase mb-8 hover:bg-white/80 transition-colors cursor-default">
            ✨ The Digital Mall of Ethiopia
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black text-gray-900 leading-[1.05] mb-6 tracking-tighter">
            Everything you need, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 drop-shadow-sm">
              delivered instantly.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600/90 mb-12 max-w-2xl mx-auto font-semibold leading-relaxed px-4">
            Discover hyper-local stores, exclusive cafes, and neighborhood businesses right in your exact physical vicinity.
          </p>

          {/* Mode Toggles */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 px-4 sm:px-0 w-full sm:w-auto mx-auto">
            <button 
              onClick={() => setMode('food')}
              className={`w-full sm:w-[240px] flex items-center justify-center gap-3 px-6 py-5 rounded-[1.5rem] font-black text-sm md:text-base tracking-wide transition-all duration-500 transform ${
                mode === 'food' 
                  ? 'bg-orange-500 text-white shadow-[0_12px_40px_-10px_rgba(249,115,22,0.6)] ring-4 ring-orange-500/20 scale-105' 
                  : 'bg-white/70 backdrop-blur-xl text-gray-600 border border-white/80 hover:bg-white hover:text-orange-500 hover:shadow-xl hover:-translate-y-1'
              }`}
            >
              <Coffee size={24} className={mode === 'food' ? 'animate-bounce' : ''} /> Food & Coffee
            </button>

            <button 
              onClick={() => setMode('retail')}
              className={`w-full sm:w-[240px] flex items-center justify-center gap-3 px-6 py-5 rounded-[1.5rem] font-black text-sm md:text-base tracking-wide transition-all duration-500 transform ${
                mode === 'retail' 
                  ? 'bg-indigo-600 text-white shadow-[0_12px_40px_-10px_rgba(79,70,229,0.6)] ring-4 ring-indigo-600/20 scale-105' 
                  : 'bg-white/70 backdrop-blur-xl text-gray-600 border border-white/80 hover:bg-white hover:text-indigo-600 hover:shadow-xl hover:-translate-y-1'
              }`}
            >
              <ShoppingBag size={24} className={mode === 'retail' ? 'animate-bounce' : ''} /> Shop Retail
            </button>
          </div>
        </div>

        {/* Dynamic Explorer */}
        {mode && (
          <div className="w-full max-w-[1400px] flex flex-col items-center relative animate-in slide-in-from-bottom-24 fade-in duration-700 ease-out mb-32">
            <div className="absolute -top-6 right-6 md:right-10 z-20">
              <div className="bg-white/90 backdrop-blur-2xl p-1.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white flex items-center gap-1">
                <button onClick={() => setViewMode('grid')} className={`p-3 rounded-xl flex items-center justify-center transition-all duration-300 ${viewMode === 'grid' ? 'bg-white shadow-[0_4px_15px_rgb(0,0,0,0.05)] text-gray-900 scale-105' : 'text-gray-400 hover:text-gray-900'}`}><LayoutGrid size={20} /></button>
                <button onClick={() => setViewMode('map')} className={`p-3 rounded-xl flex items-center justify-center transition-all duration-300 ${viewMode === 'map' ? 'bg-white shadow-[0_4px_15px_rgb(0,0,0,0.05)] text-gray-900 scale-105' : 'text-gray-400 hover:text-gray-900'}`}><MapIcon size={20} /></button>
              </div>
            </div>

            <div className="w-full h-[70vh] min-h-[600px] rounded-[2.5rem] md:rounded-[3rem] p-2 md:p-3 bg-white/40 backdrop-blur-3xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.15)] border border-white/80 relative transition-all duration-500 overflow-hidden">
              <div className="w-full h-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-white/80 relative">
                {viewMode === 'map' ? <MapExplorer mode={mode} /> : <StoreGrid mode={mode} />}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🏢 BALANCED PREMIUM FOOTER (45vh) */}
      <footer className="relative z-20 w-full bg-gray-900 text-white pt-20 pb-6 px-6 md:px-12 mt-auto overflow-hidden min-h-[45vh] flex flex-col justify-between rounded-t-[3rem] md:rounded-t-[4rem] shadow-[0_-20px_60px_rgba(0,0,0,0.15)] border-t border-gray-800">
        
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-[1400px] mx-auto w-full relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-10">
          
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6 group w-max">
              <div className="bg-indigo-600 p-3 rounded-2xl group-hover:scale-105 transition-transform"><StoreIcon size={24} className="text-white"/></div>
              <span className="text-3xl font-black tracking-tighter">Store<span className="text-indigo-500">Ville</span></span>
            </Link>
            
            <p className="text-gray-400 text-lg font-medium max-w-sm leading-relaxed mb-6">
              The premium digital mall of Ethiopia. Discover, shop, and support local businesses with instant delivery.
            </p>
            
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white transition-colors"><Instagram size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white transition-colors"><Twitter size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white transition-colors"><Facebook size={18} /></a>
            </div>
          </div>

          <div>
             <h4 className="text-sm font-black mb-6 tracking-widest uppercase text-gray-300">Platform</h4>
             <ul className="space-y-4 text-gray-400 font-medium text-sm">
               <li><a href="#" className="hover:text-indigo-400 transition-colors flex items-center gap-2">Browse Stores <ArrowRight size={14}/></a></li>
               <li><a href="#" className="hover:text-indigo-400 transition-colors flex items-center gap-2">Food Delivery <ArrowRight size={14}/></a></li>
               <li><a href="#" className="hover:text-indigo-400 transition-colors flex items-center gap-2">Retail Shopping <ArrowRight size={14}/></a></li>
               <li><a href="#" className="hover:text-indigo-400 transition-colors flex items-center gap-2">Track Order <ArrowRight size={14}/></a></li>
             </ul>
          </div>

          <div>
             <h4 className="text-sm font-black mb-6 tracking-widest uppercase text-gray-300">For Sellers</h4>
             <ul className="space-y-4 text-gray-400 font-medium text-sm">
               <li><Link href="/register" className="hover:text-indigo-400 transition-colors flex items-center gap-2">Open a Store <ArrowRight size={14}/></Link></li>
               <li><a href="#" className="hover:text-indigo-400 transition-colors flex items-center gap-2">Pricing <ArrowRight size={14}/></a></li>
               <li><a href="#" className="hover:text-indigo-400 transition-colors flex items-center gap-2">Seller Dashboard <ArrowRight size={14}/></a></li>
               <li><a href="#" className="hover:text-indigo-400 transition-colors flex items-center gap-2">API Documentation <ArrowRight size={14}/></a></li>
             </ul>
          </div>

          <div>
             <h4 className="text-sm font-black mb-6 tracking-widest uppercase text-gray-300">Support</h4>
             <ul className="space-y-4 text-gray-400 font-medium text-sm">
               <li><a href="#" className="hover:text-indigo-400 transition-colors flex items-center gap-2">Help Center <ArrowRight size={14}/></a></li>
               <li><a href="#" className="hover:text-indigo-400 transition-colors flex items-center gap-2">Terms of Service <ArrowRight size={14}/></a></li>
               <li><a href="#" className="hover:text-indigo-400 transition-colors flex items-center gap-2">Privacy Policy <ArrowRight size={14}/></a></li>
               <li><a href="#" className="hover:text-indigo-400 transition-colors flex items-center gap-2">Contact Us <ArrowRight size={14}/></a></li>
             </ul>
          </div>
        </div>

        {/* 🌟 OVERSIZED PREMIUM WATERMARK */}
        <div className="mt-auto relative flex flex-col items-center justify-end overflow-hidden pt-6 border-t border-gray-800/50">
           <h1 className="text-[14vw] font-black tracking-[-0.04em] leading-[0.75] select-none pointer-events-none text-transparent bg-clip-text bg-gradient-to-b from-gray-800/80 to-gray-900">
             STOREVILLE
           </h1>
           <p className="absolute bottom-3 text-gray-500 font-bold text-xs tracking-widest uppercase z-10">
             © 2026 StoreVille Technology. All rights reserved.
           </p>
        </div>
      </footer>

      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-8 z-[100] bg-gray-900 text-white p-5 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:bg-indigo-600 transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 flex items-center justify-center group focus:ring-4 focus:ring-indigo-500/30">
        <MessageCircle size={28} className="group-hover:animate-pulse" />
      </button>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
      `}} />
    </main>
  )
}
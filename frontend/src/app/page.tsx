'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Store as StoreIcon, Coffee, ShoppingBag, Navigation,
  Search, SlidersHorizontal, User, LogOut, Menu, X, ArrowRight,
  CheckCircle, Star, LocateFixed, Truck, Settings, Headphones
} from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { motion, AnimatePresence } from 'framer-motion'
import ProfileDropdown from '@/components/ProfileDropdown'
import MapExplorer from '@/components/MapExplorer'

type Gateway = 'RETAIL' | 'FOOD'

// ─────────────────────────────────────────────────────────
// 🚀 SPLASH SCREEN
// ─────────────────────────────────────────────────────────
function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: 'blur(12px)' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center overflow-hidden bg-[#f7f7fb]"
    >
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,rgba(99,102,241,0.04)_0%,transparent_50%,rgba(52,211,153,0.03)_100%)]"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.68, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center justify-center relative z-10"
      >
        <div className="relative overflow-hidden mb-4">
          <div className="flex items-start">
            <span className="text-[64px] font-extralight tracking-[-2.5px] leading-[68px] text-[#0f0f23]/35">Store</span>
            <span className="text-[64px] font-black tracking-[-2.5px] leading-[68px] text-[#0f0f23]">Ville</span>
            <span className="text-[18px] font-bold text-[#34d399] mt-[10px] ml-[3px]">™</span>
          </div>
          <motion.div
            initial={{ x: '-120%' }}
            animate={{ x: '140%' }}
            transition={{ duration: 0.82, delay: 0.6, ease: 'easeInOut' }}
            className="absolute inset-0 z-20 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7) 30%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.7) 70%, transparent)',
              width: '55%'
            }}
          />
        </div>

        <span className="text-[10px] font-semibold tracking-[4.5px] uppercase text-[#0f0f23]/30 text-center mb-7">
          The Digital Mall of Ethiopia
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.68 }}
        className="absolute bottom-[46px] text-[9px] font-semibold tracking-[2.5px] uppercase text-[#0f0f23]/20"
      >
        © 2026 StoreVille Technology
      </motion.div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────
// 🏠 HOME PAGE — ExploreScreen-style immersive map
// ─────────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [isMounted, setIsMounted] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [splashDone, setSplashDone] = useState(false)

  const [activeGateway, setActiveGateway] = useState<Gateway>('RETAIL')
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [activeChip, setActiveChip] = useState('Fashion')
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  // Store drawer
  const [selectedStore, setSelectedStore] = useState<any>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const isFood = activeGateway === 'FOOD'

  const foodChips = ['Cafes', 'Restaurants', 'Bakeries', 'Hotels']
  const retailChips = ['Fashion', 'Electronics', 'Home', 'Beauty']
  const chips = isFood ? foodChips : retailChips

  useEffect(() => { setIsMounted(true) }, [])



  const switchGateway = (type: Gateway) => {
    setActiveGateway(type)
    setActiveChip(type === 'FOOD' ? 'Cafes' : 'Fashion')
  }

  const handleSignOut = async () => {
    await authClient.signOut({ fetchOptions: { onSuccess: () => { window.location.href = '/' } } })
  }

  const handleSplashDone = () => {
    setShowSplash(false)
    setTimeout(() => setSplashDone(true), 700)
  }

  return (
    <>
      {/* ── SPLASH SCREEN ─────────────────────────────── */}
      <AnimatePresence>
        {showSplash && <SplashScreen onDone={handleSplashDone} />}
      </AnimatePresence>

      {/* ── MAIN VIEW ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: splashDone ? 1 : 0 }}
        transition={{ duration: 0.6 }}
        className="fixed inset-0 w-full h-full overflow-hidden"
      >
        {/* ── Full-screen Map ───────────────────────────── */}
        <div className="absolute inset-0 z-0">
          <MapExplorer
            mode={isFood ? 'food' : 'retail'}
            onStoreClick={(store) => {
              setSelectedStore(store)
              setIsDrawerOpen(true)
            }}
          />
        </div>

        {/* ── FLOATING NAVBAR ───────────────────────────── */}
        <div className="absolute top-0 inset-x-0 z-50 px-4 pt-4 pointer-events-none">
          <div className="pointer-events-auto flex items-center justify-between max-w-[1400px] mx-auto bg-white/80 backdrop-blur-2xl rounded-[1.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-white/60 px-5 py-3">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-1 group shrink-0 hover:opacity-80 transition-opacity">
              <div className="flex items-start">
                <span className="text-2xl font-light tracking-[-1px] text-gray-400">Store</span>
                <span className="text-2xl font-black tracking-[-1px] text-gray-900">Ville</span>
                <span className="text-xs font-black text-[#34d399] mt-1 ml-[1px]">™</span>
              </div>
            </Link>



            {/* Right actions */}
            <div className="flex items-center gap-3">
              
              {/* Expandable Search */}
              <div className="flex items-center relative h-10">
                <AnimatePresence>
                  {isSearchExpanded && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 220, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-8 md:right-10 overflow-hidden h-10 z-[60]"
                    >
                      <input 
                        type="text" 
                        placeholder="Search stores…" 
                        className="w-full h-full bg-gray-100 rounded-l-full pl-4 pr-6 outline-none text-sm font-medium text-gray-800 placeholder-gray-500 shadow-inner" 
                        autoFocus
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                  className={`relative z-[65] w-9 h-9 md:w-10 md:h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors ${isSearchExpanded ? 'bg-gray-100 rounded-r-full' : 'bg-transparent hover:bg-gray-100 rounded-full'}`}
                >
                  <Search size={18} strokeWidth={2.5} />
                </button>
              </div>

              {isMounted && session ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white hover:bg-black transition-colors shadow-lg shadow-gray-900/30 shrink-0"
                  >
                    <User size={18} />
                  </button>
                  <ProfileDropdown isOpen={isUserMenuOpen} onClose={() => setIsUserMenuOpen(false)} onSignOut={handleSignOut} />
                </div>
              ) : (
                <Link
                  href="/login"
                  className="bg-gray-900 text-white text-xs md:text-sm px-4 md:px-5 py-2 md:py-2.5 rounded-xl font-bold shadow-lg hover:bg-black transition-all duration-300 hover:shadow-gray-900/30 shrink-0"
                >
                  <span className="hidden sm:inline">Sign In</span>
                  <span className="sm:hidden">Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── CHIPS UNDER NAVBAR ───────────────────── */}
        <div className="absolute z-40 inset-x-4 top-[88px] pointer-events-none">
          <div className="max-w-[1400px] mx-auto pointer-events-auto flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none justify-center md:px-5">
            {chips.map((chip) => {
              const active = activeChip === chip
              return (
                <button
                  key={chip}
                  onClick={() => setActiveChip(chip)}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-black tracking-wide border transition-all duration-200 shadow-sm ${active
                    ? 'bg-gray-900 text-white border-gray-900 shadow-[0_4px_14px_rgba(0,0,0,0.2)]'
                    : 'bg-white/90 backdrop-blur-xl text-gray-600 border-white/60 hover:bg-white hover:text-gray-900'
                    }`}
                >
                  {chip}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── BOTTOM CONTROLS CLUSTER ─────────────────────── */}

        <div className="absolute z-40 bottom-6 inset-x-0 flex flex-col items-center gap-4 px-4 pointer-events-none">
          {/* 1. GATEWAY SWITCHER PILLS */}
          <div className="flex items-center gap-3 pointer-events-auto">
            {/* Shop Retail */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => switchGateway('RETAIL')}
              className={`flex items-center gap-2.5 px-6 py-4 rounded-full font-black text-sm tracking-wide shadow-md transition-all duration-300 border ${activeGateway === 'RETAIL'
                  ? 'bg-gray-900 text-white border-gray-900 scale-105 shadow-gray-900/30'
                  : 'bg-white/90 backdrop-blur-2xl text-gray-700 border-white/60 hover:bg-white hover:text-gray-900 scale-100'
                }`}
            >
              <ShoppingBag size={18} strokeWidth={2.5} />
              Shop Retail
            </motion.button>

            {/* Food & Coffee */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => switchGateway('FOOD')}
              className={`flex items-center gap-2.5 px-6 py-4 rounded-full font-black text-sm tracking-wide shadow-md transition-all duration-300 border ${activeGateway === 'FOOD'
                  ? 'bg-orange-500 text-white border-orange-500 scale-105 shadow-orange-500/30'
                  : 'bg-white/90 backdrop-blur-2xl text-gray-700 border-white/60 hover:bg-white hover:text-gray-900 scale-100'
                }`}
            >
              <Coffee size={18} strokeWidth={2.5} />
              Food & Coffee
            </motion.button>
          </div>
        </div>

        {/* ── STORE DISCOVERY DRAWER ────────────────────── */}
        <AnimatePresence>
          {isDrawerOpen && selectedStore && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => { setIsDrawerOpen(false); setTimeout(() => setSelectedStore(null), 300) }}
                className="absolute inset-0 z-[60] bg-black/20 backdrop-blur-[2px]"
              />

              {/* Drawer */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="absolute bottom-0 inset-x-0 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[480px] md:bottom-8 z-[70] bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-[0_-20px_60px_rgba(0,0,0,0.2)] overflow-hidden mt-auto md:mt-0"
              >
                <div className="px-6 pt-4 pb-8 max-w-lg mx-auto">
                  {/* Handle */}
                  <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

                  {/* Close */}
                  <button
                    onClick={() => { setIsDrawerOpen(false); setTimeout(() => setSelectedStore(null), 300) }}
                    className="absolute top-4 right-5 w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <X size={16} className="text-gray-600" />
                  </button>

                  {/* Hero banner */}
                  <div className={`h-32 rounded-2xl mb-5 flex items-center justify-center border ${isFood ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-100'}`}>
                    {selectedStore.logo ? (
                      <img src={selectedStore.logo} alt={selectedStore.name} className="h-full w-full object-cover rounded-2xl" />
                    ) : (
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl ${isFood ? 'bg-orange-500 shadow-orange-500/30' : 'bg-gray-900 shadow-gray-900/20'}`}>
                        {isFood ? <Coffee size={30} className="text-white" /> : <ShoppingBag size={30} className="text-white" />}
                      </div>
                    )}
                  </div>

                  {/* Store name + badge */}
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">{selectedStore.name}</h2>
                    <span className="bg-green-100 text-green-700 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle size={10} strokeWidth={3} /> Verified
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 font-medium mb-5">{selectedStore.category || (isFood ? 'Food & Beverage' : 'Retail')}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { icon: Navigation, label: '1.2 km', sub: 'Distance', color: '#111827' },
                      { icon: Star, label: '4.8', sub: '200+ reviews', color: '#f59e0b' },
                      { icon: CheckCircle, label: 'Open', sub: 'Until 10 PM', color: '#16a34a' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-gray-50 rounded-2xl p-3 flex flex-col items-center gap-1 border border-gray-100">
                        <stat.icon size={16} color={stat.color} strokeWidth={2} />
                        <span className="text-sm font-black text-gray-900">{stat.label}</span>
                        <span className="text-[10px] font-semibold text-gray-400">{stat.sub}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => router.push(`/store/${selectedStore.slug}`)}
                    className={`w-full py-4 rounded-2xl font-black text-white text-sm tracking-wide flex items-center justify-center gap-3 shadow-xl transition-all hover:opacity-90 hover:-translate-y-0.5 ${isFood ? 'bg-orange-500 shadow-orange-500/30' : 'bg-gray-900 shadow-gray-900/20'}`}
                  >
                    {isFood ? 'Order From This Place' : 'Enter Store'}
                    <ArrowRight size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Scrollbar hide utility */}
      <style dangerouslySetInnerHTML={{ __html: `.scrollbar-none::-webkit-scrollbar { display: none; } .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }` }} />
    </>
  )
}
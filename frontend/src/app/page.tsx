'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Store as StoreIcon, Coffee, ShoppingBag, Navigation,
  Search, SlidersHorizontal, User, LogOut, Menu, X, ArrowRight,
  CheckCircle, Star, LocateFixed, Truck
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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

  useEffect(() => {
    if (isMobileMenuOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isMobileMenuOpen])

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
              <div className="hidden md:flex items-center relative h-10 border border-transparent mr-2">
                <AnimatePresence>
                  {isSearchExpanded && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 220, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <input 
                        type="text" 
                        placeholder="Search stores…" 
                        className="w-full h-full bg-gray-100 rounded-l-full pl-4 pr-1 outline-none text-sm font-medium text-gray-800 placeholder-gray-500" 
                        autoFocus
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                  className={`w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors ${isSearchExpanded ? 'bg-gray-100 rounded-r-full' : 'bg-transparent hover:bg-gray-100 rounded-full'}`}
                >
                  <Search size={18} strokeWidth={2.5} />
                </button>
              </div>

              <button className="hidden lg:flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-xl hover:bg-gray-100">
                <Truck size={16} /> Track Order
              </button>

              {isMounted && session ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white hover:bg-black transition-colors shadow-lg shadow-gray-900/30"
                  >
                    <User size={18} />
                  </button>
                  <ProfileDropdown isOpen={isUserMenuOpen} onClose={() => setIsUserMenuOpen(false)} onSignOut={handleSignOut} />
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden md:block bg-gray-900 text-white text-sm px-5 py-2.5 rounded-xl font-bold shadow-lg hover:bg-black transition-all duration-300 hover:shadow-gray-900/30"
                >
                  Sign in
                </Link>
              )}

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-900"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── CHIPS UNDER NAVBAR ───────────────────── */}
        <div className="absolute z-40 inset-x-4 top-[88px] pointer-events-none">
          <div className="max-w-[1400px] mx-auto pointer-events-auto flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none justify-center md:justify-start md:px-5">
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

        {/* ── BOTTOM LOCATE ME BUTTON ──────────────────────────── */}
        <button className="absolute z-40 right-5 bottom-24 md:bottom-24 w-12 h-12 rounded-full bg-white shadow-[0_8px_30px_rgba(0,0,0,0.15)] border border-white/60 flex items-center justify-center hover:scale-105 transition-transform group">
          <LocateFixed size={20} className="text-gray-700 group-hover:text-gray-900 transition-colors" strokeWidth={2.5} />
        </button>

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
                className="absolute bottom-0 inset-x-0 z-[70] bg-white rounded-t-[2.5rem] shadow-[0_-20px_60px_rgba(0,0,0,0.2)] overflow-hidden"
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

        {/* ── MOBILE MENU OVERLAY ───────────────────────── */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80]"
            >
              <div className="absolute inset-0 bg-gray-900/95 backdrop-blur-2xl" />
              <div className="relative h-full flex flex-col p-8 pt-24">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
                >
                  <X size={22} className="text-white" />
                </button>

                <div className="space-y-6">
                  {[
                    { href: '/', label: 'Home' },
                    { href: '/stores/launch', label: 'Open a Store' },
                  ].map((link) => (
                    <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-3xl font-black text-white tracking-tighter hover:text-gray-400 transition-colors">
                      {link.label}
                    </Link>
                  ))}
                  <button className="flex items-center gap-3 text-2xl font-bold text-white/70">
                    <Truck size={22} /> Track Order
                  </button>
                </div>

                <div className="mt-auto">
                  {session ? (
                    <button onClick={handleSignOut} className="w-full py-4 rounded-2xl bg-white/10 text-white font-bold text-lg flex items-center justify-center gap-2">
                      <LogOut size={20} /> Sign Out
                    </button>
                  ) : (
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full py-4 rounded-2xl bg-white text-gray-900 text-center font-black text-lg shadow-xl shadow-black/30 hover:bg-gray-100 transition-colors">
                      Sign In / Sign Up
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Scrollbar hide utility */}
      <style dangerouslySetInnerHTML={{ __html: `.scrollbar-none::-webkit-scrollbar { display: none; } .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }` }} />
    </>
  )
}
'use client'
import { usePathname } from 'next/navigation'
import { Palette, Menu, X, Package, ShoppingBag, LayoutDashboard, Settings, LogOut, Sun, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { authClient } from '@/lib/auth-client'
import Link from 'next/link'

// ─────────────────────────────────────────────────────────────────────────────
// PREMIUM DARK THEME  ·  Obsidian Soft UI
// A true premium dark aesthetic inspired by Apple, Linear, and modern luxury.
// ─────────────────────────────────────────────────────────────────────────────
const DARK_CSS = `
  /* ── Root tokens ───────────────────────────────────────────────────────── */
  [data-seller-theme="dark"] {
    color-scheme: dark;
  }

  /* ── Page background — True obsidian black ─────────────────────────────── */
  [data-seller-theme="dark"] .fixed.inset-0.z-0 {
    background: #000000 !important;
  }

  /* ── Grid texture — extremely subtle white mesh ────────────────────────── */
  [data-seller-theme="dark"] .fixed.inset-0.z-0 > div {
    background-image:
      linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px) !important;
    mix-blend-mode: normal !important;
    opacity: 0.8 !important;
  }

  /* ── Sidebar — Dark frosted glass structure ────────────────────────────── */
  [data-seller-theme="dark"] aside.fixed {
    background: rgba(10, 10, 10, 0.85) !important;
    border-right: 1px solid rgba(255, 255, 255, 0.08) !important;
    box-shadow: 4px 0 24px rgba(0,0,0,0.9) !important;
    backdrop-filter: blur(20px) !important;
  }

  /* ── Sidebar logo border ───────────────────────────────────────────────── */
  [data-seller-theme="dark"] aside .border-b,
  [data-seller-theme="dark"] aside .border-t {
    border-color: rgba(255,255,255,0.06) !important;
  }

  /* ── Nav links — unselected state ──────────────────────────────────────── */
  [data-seller-theme="dark"] aside a,
  [data-seller-theme="dark"] aside a .text-gray-500 {
    color: rgba(255,255,255,0.5) !important;
  }
  [data-seller-theme="dark"] aside a:hover {
    background: rgba(255,255,255,0.04) !important;
    color: rgba(255,255,255,0.9) !important;
  }

  /* ── Nav — ACTIVE pill (Crisp high-contrast white glass) ────────────────── */
  [data-seller-theme="dark"] aside a.bg-gray-100 {
    background: rgba(255,255,255,0.12) !important;
    border-color: rgba(255,255,255,0.1) !important;
    color: #ffffff !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important;
  }

  /* ── Logout button ──────────────────────────────────────────────────────── */
  [data-seller-theme="dark"] aside button:not(.theme-toggle):hover {
    background: rgba(239, 68, 68, 0.1) !important;
    color: #ef4444 !important;
  }

  /* ── Mobile header ──────────────────────────────────────────────────────── */
  [data-seller-theme="dark"] header.fixed {
    background: rgba(0, 0, 0, 0.8) !important;
    border-bottom: 1px solid rgba(255,255,255,0.08) !important;
    backdrop-filter: blur(24px) !important;
  }

  /* ── Glass cards — Translucent dark graphite ────────────────────────────── */
  [data-seller-theme="dark"] .bg-white\/70,
  [data-seller-theme="dark"] .bg-white\/80 {
    background: rgba(18, 18, 18, 0.6) !important;
    border-color: rgba(255, 255, 255, 0.08) !important;
    box-shadow:
      0 1px 0 rgba(255,255,255,0.05) inset,
      0 8px 32px rgba(0,0,0,0.8) !important;
    backdrop-filter: blur(24px) saturate(140%) !important;
  }
  [data-seller-theme="dark"] .hover\:bg-white:hover {
    background: rgba(30, 30, 30, 0.8) !important;
    box-shadow:
      0 1px 0 rgba(255,255,255,0.08) inset,
      0 12px 48px rgba(0,0,0,0.9) !important;
  }

  /* ── bg-white (non-card solid whites) ──────────────────────────────────── */
  [data-seller-theme="dark"] .bg-white:not(.theme-toggle-track) {
    background: rgba(255,255,255,0.03) !important;
    border-color: rgba(255,255,255,0.08) !important;
  }
  [data-seller-theme="dark"] .bg-white\/90 {
    background: rgba(255,255,255,0.04) !important;
  }
  [data-seller-theme="dark"] .bg-white\/60,
  [data-seller-theme="dark"] .bg-white\/50,
  [data-seller-theme="dark"] .bg-white\/40,
  [data-seller-theme="dark"] .bg-white\/20 {
    background: rgba(255,255,255,0.02) !important;
  }

  /* ── Subtle section backgrounds ─────────────────────────────────────────── */
  [data-seller-theme="dark"] .bg-gray-50 {
    background-color: rgba(255,255,255,0.03) !important;
  }
  [data-seller-theme="dark"] .bg-gray-100 {
    background-color: rgba(255,255,255,0.05) !important;
  }
  [data-seller-theme="dark"] .bg-gray-200 {
    background-color: rgba(255,255,255,0.08) !important;
  }

  /* ── Hover backgrounds ──────────────────────────────────────────────────── */
  [data-seller-theme="dark"] .hover\:bg-gray-50:hover  { background-color: rgba(255,255,255,0.05) !important; }
  [data-seller-theme="dark"] .hover\:bg-gray-100:hover { background-color: rgba(255,255,255,0.08) !important; }
  [data-seller-theme="dark"] .hover\:bg-white\/50:hover,
  [data-seller-theme="dark"] .hover\:bg-white\/60:hover { background: rgba(255,255,255,0.04) !important; }

  /* ── Borders ────────────────────────────────────────────────────────────── */
  [data-seller-theme="dark"] .border-gray-50  { border-color: rgba(255,255,255,0.04) !important; }
  [data-seller-theme="dark"] .border-gray-100 { border-color: rgba(255,255,255,0.08) !important; }
  [data-seller-theme="dark"] .border-gray-200 { border-color: rgba(255,255,255,0.12) !important; }
  [data-seller-theme="dark"] .border-gray-300 { border-color: rgba(255,255,255,0.16) !important; }
  [data-seller-theme="dark"] .border-white    { border-color: rgba(255,255,255,0.06) !important; }

  [data-seller-theme="dark"] .border-t { border-top-color: rgba(255,255,255,0.08) !important; }
  [data-seller-theme="dark"] .border-b { border-bottom-color: rgba(255,255,255,0.08) !important; }
  [data-seller-theme="dark"] .border-l { border-left-color: rgba(255,255,255,0.08) !important; }
  [data-seller-theme="dark"] .border-r { border-right-color: rgba(255,255,255,0.08) !important; }
  [data-seller-theme="dark"] .divide-y > * + * { border-color: rgba(255,255,255,0.08) !important; }

  /* ── Typography — Pure monochrome sharpness ─────────────────────────────── */
  [data-seller-theme="dark"] .text-gray-900 { color: #f9fafb !important; }
  [data-seller-theme="dark"] .text-gray-700 { color: #e5e7eb !important; }
  [data-seller-theme="dark"] .text-gray-600 { color: #d1d5db !important; }
  [data-seller-theme="dark"] .text-gray-500 { color: #9ca3af !important; }
  [data-seller-theme="dark"] .text-gray-400 { color: #6b7280 !important; }
  [data-seller-theme="dark"] .text-gray-300 { color: #4b5563 !important; }
  [data-seller-theme="dark"] .hover\:text-gray-900:hover { color: #ffffff !important; }

  /* ── Form controls — Ghost slate inputs ─────────────────────────────────── */
  [data-seller-theme="dark"] input:not([type="checkbox"]):not([type="radio"]):not([type="file"]):not([type="range"]):not([type="color"]),
  [data-seller-theme="dark"] textarea,
  [data-seller-theme="dark"] select {
    background: rgba(255,255,255,0.04) !important;
    border-color: rgba(255,255,255,0.12) !important;
    color: #f9fafb !important;
  }
  [data-seller-theme="dark"] input::placeholder,
  [data-seller-theme="dark"] textarea::placeholder {
    color: rgba(255,255,255,0.3) !important;
  }
  [data-seller-theme="dark"] input:focus,
  [data-seller-theme="dark"] textarea:focus,
  [data-seller-theme="dark"] select:focus {
    background: rgba(255,255,255,0.08) !important;
    border-color: rgba(255,255,255,0.4) !important;
    box-shadow: 0 0 0 3px rgba(255,255,255,0.1) !important;
    outline: none !important;
  }

  /* ── Primary CTA buttons — High contrast white ──────────────────────────── */
  [data-seller-theme="dark"] .bg-gray-900:not(aside a):not(aside) {
    background: #ffffff !important;
    color: #000000 !important;
  }
  [data-seller-theme="dark"] .bg-gray-900:not(aside a):not(aside) * {
    color: #000000 !important;
  }
  [data-seller-theme="dark"] .bg-black:not(.theme-toggle-knob) {
    background: #ffffff !important;
    color: #000000 !important;
  }
  [data-seller-theme="dark"] .bg-black:not(.theme-toggle-knob) * {
    color: #000000 !important;
  }
  [data-seller-theme="dark"] .text-white { color: #ffffff !important; }

  /* ── Shadows — deepen for true black contrast ──────────────────────────── */
  [data-seller-theme="dark"] .shadow-sm  { box-shadow: 0 1px 4px rgba(0,0,0,0.8) !important; }
  [data-seller-theme="dark"] .shadow-md  { box-shadow: 0 4px 16px rgba(0,0,0,0.9) !important; }
  [data-seller-theme="dark"] .shadow-\[0_8px_30px_rgb\(0\,0\,0\,0\.04\)\] {
    box-shadow:
      0 1px 0 rgba(255,255,255,0.05) inset,
      0 12px 48px rgba(0,0,0,0.9) !important;
  }

  /* ── Status Colors Rebalancing ─────────────────────────────────────────── */
  [data-seller-theme="dark"] .text-red-500,
  [data-seller-theme="dark"] .text-red-600    { color: #f87171 !important; }
  [data-seller-theme="dark"] .bg-red-50       { background: rgba(248,113,113,0.1) !important; }
  [data-seller-theme="dark"] .text-green-500,
  [data-seller-theme="dark"] .text-green-700  { color: #4ade80 !important; }
  [data-seller-theme="dark"] .text-emerald-600{ color: #34d399 !important; }
  [data-seller-theme="dark"] .text-orange-500,
  [data-seller-theme="dark"] .text-orange-600,
  [data-seller-theme="dark"] .text-orange-700 { color: #fb923c !important; }
  [data-seller-theme="dark"] .text-blue-600   { color: #60a5fa !important; }
  [data-seller-theme="dark"] .bg-orange-50    { background: rgba(251,146,60,0.1) !important; }
  [data-seller-theme="dark"] .bg-green-50     { background: rgba(74,222,128,0.1) !important; }
  [data-seller-theme="dark"] .border-orange-100,
  [data-seller-theme="dark"] .border-orange-200{ border-color: rgba(251,146,60,0.2) !important; }

  /* ── Scrollbar ─────────────────────────────────────────────────────────── */
  [data-seller-theme="dark"] ::-webkit-scrollbar-track {
    background: transparent;
  }
  [data-seller-theme="dark"] ::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.15);
    border-radius: 8px;
  }
  [data-seller-theme="dark"] ::-webkit-scrollbar-thumb:hover {
    background: rgba(255,255,255,0.25);
  }

  /* ── Theme toggle button ─────────────────────────────────────────────────── */
  [data-seller-theme="dark"] .theme-toggle-row {
    background: rgba(255,255,255,0.04) !important;
    border-color: rgba(255,255,255,0.08) !important;
    color: rgba(255,255,255,0.6) !important;
  }
  [data-seller-theme="dark"] .theme-toggle-row:hover {
    background: rgba(255,255,255,0.08) !important;
    color: #ffffff !important;
  }
`

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)

  // ── Persist theme ──────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      if (localStorage.getItem('seller-theme') === 'dark') setIsDark(true)
    } catch {}
  }, [])

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev
      try { localStorage.setItem('seller-theme', next ? 'dark' : 'light') } catch {}
      return next
    })
  }

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isMobileMenuOpen])

  useEffect(() => { setIsMobileMenuOpen(false) }, [pathname])

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: { onSuccess: () => { window.location.href = '/login' } }
    })
  }

  const isActive = (path: string) => pathname === path

  const navItems = [
    { href: '/dashboard/seller',          icon: <LayoutDashboard size={17} />, label: 'Overview'       },
    { href: '/dashboard/seller/products', icon: <Package         size={17} />, label: 'My Products'    },
    { href: '/dashboard/seller/orders',   icon: <ShoppingBag     size={17} />, label: 'Incoming Orders' },
    { href: '/dashboard/seller/studio',   icon: <Palette         size={17} />, label: 'Seller Studio'  },
    { href: '/dashboard/seller/settings', icon: <Settings        size={17} />, label: 'Settings'       },
  ]

  return (
    <ProtectedRoute allowedRoles={['SELLER']}>
      <style dangerouslySetInnerHTML={{ __html: DARK_CSS }} />

      <div
        data-seller-theme={isDark ? 'dark' : 'light'}
        className="min-h-screen relative font-sans text-gray-900 overflow-x-hidden flex selection:bg-gray-900 selection:text-white"
        style={{ transition: 'background 0.4s ease, color 0.3s ease' }}
      >

        {/* ── MOBILE HEADER ──────────────────────────────────────────────── */}
        <header className="fixed top-0 inset-x-0 h-16 bg-white/80 backdrop-blur-2xl border-b border-gray-100 z-[90] flex items-center justify-between px-6 md:hidden">
          <Link href="/" className="inline-flex items-center gap-1 hover:opacity-80 transition-opacity">
            <div className="flex items-start">
              <span className="text-xl font-light tracking-[-0.5px] text-gray-400">Store</span>
              <span className="text-xl font-black tracking-[-0.5px] text-gray-900">Ville</span>
              <span className="text-[10px] font-black text-[#34d399] mt-0.5 ml-0.5">™</span>
            </div>
          </Link>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* ── BACKDROP OVERLAY ────────────────────────────────────────────── */}
        <div
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[95] transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* ── PAGE BACKGROUND ─────────────────────────────────────────────── */}
        <div className="fixed inset-0 z-0 bg-gray-50">
          <div className="absolute inset-0 opacity-[0.4] mix-blend-overlay bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]" />
        </div>

        {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
        <aside className={`w-64 bg-white/90 backdrop-blur-3xl border-r border-gray-100 shadow-[8px_0_30px_rgb(0,0,0,0.02)] fixed h-full z-[100] transition-transform duration-500 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>

          {/* Logo */}
          <div className="p-6 flex items-center gap-2 border-b border-gray-50">
            <Link href="/" className="inline-flex items-center gap-1 hover:opacity-80 transition-opacity">
              <div className="flex items-start">
                <span className="text-2xl font-light tracking-[-1px] text-gray-400">Store</span>
                <span className="text-2xl font-black tracking-[-1px] text-gray-900">Ville</span>
                <span className="text-xs font-black text-[#34d399] mt-1 ml-[1px]">™</span>
              </div>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-5 px-4 space-y-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">Menu</p>
            {navItems.map(item => (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-[1.25rem] text-sm font-bold transition-all group border ${
                  isActive(item.href)
                    ? 'bg-gray-100 shadow-sm border-gray-200 text-gray-900'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-transparent'
                }`}>
                <span className="group-hover:scale-110 transition-transform shrink-0">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Bottom controls */}
          <div className="p-4 border-t border-gray-100 space-y-1">

            {/* ─ Theme Toggle ─────────────────────────────────────────────── */}
            <button
              onClick={toggleTheme}
              className="theme-toggle-row w-full flex items-center justify-between px-4 py-3 rounded-[1.25rem] text-xs font-bold transition-all duration-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
            >
              <span className="flex items-center gap-2.5">
                {isDark
                  ? <Sun size={15} style={{ color: '#fbbf24' }} />
                  : <Moon size={15} />}
                <span className="uppercase tracking-widest">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
              </span>

              {/* Pill toggle */}
              <span
                style={{
                  display: 'inline-flex', width: 40, height: 22, borderRadius: 11, padding: 2,
                  transition: 'background 0.3s',
                  background: isDark ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(0,0,0,0.15)',
                  boxShadow: isDark ? '0 0 12px rgba(99,102,241,0.4)' : 'none',
                  position: 'relative', flexShrink: 0,
                }}
                aria-hidden
              >
                <span style={{
                  width: 18, height: 18, borderRadius: 9, background: '#fff',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                  transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                  transform: isDark ? 'translateX(18px)' : 'translateX(0)',
                  display: 'block',
                }} />
              </span>
            </button>

            {/* ─ Logout ───────────────────────────────────────────────────── */}
            <button onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 text-xs text-red-500 hover:bg-white hover:text-red-600 hover:shadow-sm rounded-[1.25rem] font-bold transition-all uppercase tracking-widest group">
              <LogOut size={15} className="group-hover:-translate-x-1 transition-transform" />
              Secure Log Out
            </button>
          </div>
        </aside>

        {/* ── CONTENT AREA ─────────────────────────────────────────────────── */}
        <div className="flex-1 ml-0 md:ml-64 relative z-10 w-full overflow-x-hidden min-h-screen pt-16 md:pt-0">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  )
}
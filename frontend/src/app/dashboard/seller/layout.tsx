'use client'
import { useRouter, usePathname } from 'next/navigation'
import { Palette, Menu, X, Tags, Store as StoreIcon, Package, ShoppingBag, LayoutDashboard, Settings, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { authClient } from '@/lib/auth-client'
import Link from 'next/link'

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // 🌟 ESCAPE KEY & SCROLL LOCK: Ensure a premium UX when the drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isMobileMenuOpen])

  // Close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          // 🌟 FORCE HARD RELOAD: Total cache wipe to prevent Firefox sticky sessions.
          window.location.href = '/login'
        }
      }
    })
  }

  // Helper to highlight the active menu item
  const isActive = (path: string) => pathname === path

  return (
    <ProtectedRoute allowedRoles={['SELLER']}>
      <div className="min-h-screen relative font-sans text-gray-900 overflow-x-hidden flex selection:bg-gray-900 selection:text-white">
        
        {/* 📱 MOBILE HEADER (Visible on sm/md) */}
        <header className="fixed top-0 inset-x-0 h-16 bg-white/80 backdrop-blur-2xl border-b border-gray-100 z-[90] flex items-center justify-between px-6 md:hidden">
          <Link href="/" className="inline-flex items-center gap-1 group hover:opacity-80 transition-opacity">
            <div className="flex items-start">
              <span className="text-xl font-light tracking-[-0.5px] text-gray-400">Store</span>
              <span className="text-xl font-black tracking-[-0.5px] text-gray-900">Ville</span>
              <span className="text-[10px] font-black text-[#34d399] mt-0.5 ml-0.5">™</span>
            </div>
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-gray-50 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* 🌑 BACKDROP OVERLAY */}
        <div 
          className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[95] transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* 🎨 UNIVERSAL BACKGROUND SYSTEM */}
        <div className="fixed inset-0 z-0 bg-gray-50">
          <div className="absolute inset-0 opacity-[0.4] mix-blend-overlay bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]"></div>
        </div>

        {/* Persistent Glass Sidebar / Mobile Drawer */}
        <aside className={`w-64 bg-white/90 backdrop-blur-3xl border-r border-gray-100 shadow-[8px_0_30px_rgb(0,0,0,0.02)] fixed h-full z-[100] transition-transform duration-500 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
          <div className="p-6 flex items-center gap-2 border-b border-gray-50 relative">
            <Link href="/" className="inline-flex items-center gap-1 group hover:opacity-80 transition-opacity">
              <div className="flex items-start">
                <span className="text-2xl font-light tracking-[-1px] text-gray-400">Store</span>
                <span className="text-2xl font-black tracking-[-1px] text-gray-900">Ville</span>
                <span className="text-xs font-black text-[#34d399] mt-1 ml-[1px]">™</span>
              </div>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">Menu</div>
            
            <Link href="/dashboard/seller" className={`flex items-center gap-3 px-4 py-3.5 rounded-[1.25rem] text-sm font-bold transition-all group ${isActive('/dashboard/seller') ? 'bg-gray-100 shadow-sm border border-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-transparent'}`}>
              <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform" /> Overview
            </Link>
            <Link href="/dashboard/seller/categories" className={`flex items-center gap-3 px-4 py-3.5 rounded-[1.25rem] text-sm font-bold transition-all group mt-1 ${isActive('/dashboard/seller/categories') ? 'bg-gray-100 shadow-sm border border-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-transparent'}`}>
              <Tags size={18} className="group-hover:scale-110 transition-transform" /> Categories
            </Link>
            <Link href="/dashboard/seller/products" className={`flex items-center gap-3 px-4 py-3.5 rounded-[1.25rem] text-sm font-bold transition-all group mt-1 ${isActive('/dashboard/seller/products') ? 'bg-gray-100 shadow-sm border border-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-transparent'}`}>
              <Package size={18} className="group-hover:scale-110 transition-transform" /> My Products
            </Link>
            <Link href="/dashboard/seller/orders" className={`flex items-center gap-3 px-4 py-3.5 rounded-[1.25rem] text-sm font-bold transition-all group mt-1 ${isActive('/dashboard/seller/orders') ? 'bg-gray-100 shadow-sm border border-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-transparent'}`}>
              <ShoppingBag size={18} className="group-hover:scale-110 transition-transform" /> Incoming Orders
            </Link>
            <Link href="/dashboard/seller/settings" className={`flex items-center gap-3 px-4 py-3.5 rounded-[1.25rem] text-sm font-bold transition-all group mt-1 ${isActive('/dashboard/seller/settings') ? 'bg-gray-100 shadow-sm border border-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-transparent'}`}>
              <Palette size={18} className="group-hover:scale-110 transition-transform" /> Store Settings
            </Link>
          </div>

          <div className="p-4 border-t border-white/50 bg-white/20">
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-4 py-3.5 text-xs text-red-500 hover:bg-white hover:text-red-600 hover:shadow-sm rounded-[1.25rem] font-bold transition-all uppercase tracking-widest group">
              <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> Secure Log Out
            </button>
          </div>
        </aside>

        {/* Dynamic Content Area */}
        <div className="flex-1 ml-0 md:ml-64 relative z-10 w-full overflow-x-hidden min-h-screen pt-16 md:pt-0">
          {children}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `@keyframes gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`}} />
    </ProtectedRoute>
  )
}
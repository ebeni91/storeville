'use client'
import { Tags } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { authClient } from '@/lib/auth-client'
import { Store as StoreIcon, Package, ShoppingBag, LayoutDashboard, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Palette } from 'lucide-react'
export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

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
      <div className="min-h-screen relative font-sans text-gray-900 overflow-x-hidden flex selection:bg-indigo-500 selection:text-white">
        
        {/* 🎨 UNIVERSAL BACKGROUND SYSTEM */}
        <div className="fixed inset-0 z-0 bg-[length:200%_200%] animate-[gradient_15s_ease_infinite] bg-gradient-to-br from-[#eef2ff] via-[#f3e8ff] to-[#cffafe]">
          <div className="absolute inset-0 opacity-[0.25] mix-blend-overlay bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]"></div>
        </div>

        {/* Persistent Glass Sidebar */}
        <aside className="w-64 bg-white/70 backdrop-blur-3xl border-r border-white shadow-[8px_0_30px_rgb(0,0,0,0.02)] hidden md:flex flex-col fixed h-full z-[100] transition-all">
          <div className="p-6 flex items-center gap-2 text-indigo-600 border-b border-white relative">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-[0_4px_20px_rgba(79,70,229,0.3)]"><StoreIcon size={24} className="text-white" /></div>
            <span className="text-2xl font-black tracking-tighter text-gray-900">Store<span className="text-indigo-600">Ville</span></span>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">Menu</div>
            
            <Link href="/dashboard/seller" className={`flex items-center gap-3 px-4 py-3.5 rounded-[1.25rem] text-sm font-bold transition-all group ${isActive('/dashboard/seller') ? 'bg-white shadow-sm border border-white text-indigo-600' : 'text-gray-500 hover:bg-white/50 hover:text-gray-900 border border-transparent'}`}>
              <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform" /> Overview
            </Link>
            <Link href="/dashboard/seller/categories" className={`flex items-center gap-3 px-4 py-3.5 rounded-[1.25rem] text-sm font-bold transition-all group mt-1 ${isActive('/dashboard/seller/categories') ? 'bg-white shadow-sm border border-white text-indigo-600' : 'text-gray-500 hover:bg-white/50 hover:text-gray-900 border border-transparent'}`}>
              <Tags size={18} className="group-hover:scale-110 transition-transform" /> Categories
            </Link>
            <Link href="/dashboard/seller/products" className={`flex items-center gap-3 px-4 py-3.5 rounded-[1.25rem] text-sm font-bold transition-all group mt-1 ${isActive('/dashboard/seller/products') ? 'bg-white shadow-sm border border-white text-indigo-600' : 'text-gray-500 hover:bg-white/50 hover:text-gray-900 border border-transparent'}`}>
              <Package size={18} className="group-hover:scale-110 transition-transform" /> My Products
            </Link>
            <Link href="/dashboard/seller/orders" className={`flex items-center gap-3 px-4 py-3.5 rounded-[1.25rem] text-sm font-bold transition-all group mt-1 ${isActive('/dashboard/seller/orders') ? 'bg-white shadow-sm border border-white text-indigo-600' : 'text-gray-500 hover:bg-white/50 hover:text-gray-900 border border-transparent'}`}>
              <ShoppingBag size={18} className="group-hover:scale-110 transition-transform" /> Incoming Orders
            </Link>
            <Link href="/dashboard/seller/settings" className={`flex items-center gap-3 px-4 py-3.5 rounded-[1.25rem] text-sm font-bold transition-all group mt-1 ${isActive('/dashboard/seller/settings') ? 'bg-white shadow-sm border border-white text-indigo-600' : 'text-gray-500 hover:bg-white/50 hover:text-gray-900 border border-transparent'}`}>
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
        <div className="flex-1 ml-0 md:ml-64 relative z-10 w-full overflow-x-hidden min-h-screen">
          {children}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `@keyframes gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`}} />
    </ProtectedRoute>
  )
}
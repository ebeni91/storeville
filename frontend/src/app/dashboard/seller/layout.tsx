'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuthStore } from '@/store/authStore'
import { Store as StoreIcon, Package, ShoppingBag, LayoutDashboard, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuthStore()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  // Helper to highlight the active menu item
  const isActive = (path: string) => pathname === path

  return (
    <ProtectedRoute allowedRoles={['SELLER']}>
      <div className="min-h-screen bg-gray-50 flex">
        
        {/* Persistent Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-20">
          <div className="p-6 flex items-center gap-2 text-indigo-600 border-b border-gray-100">
            <StoreIcon size={28} className="fill-indigo-100" />
            <span className="text-2xl font-extrabold tracking-tight text-indigo-700">StoreVille</span>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
            <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4 px-2">Menu</div>
            
            <Link href="/dashboard/seller" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive('/dashboard/seller') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <LayoutDashboard size={20} /> Overview
            </Link>
            <Link href="/dashboard/seller/products" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive('/dashboard/seller/products') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <Package size={20} /> My Products
            </Link>
            <Link href="/dashboard/seller/orders" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive('/dashboard/seller/orders') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <ShoppingBag size={20} /> Incoming Orders
            </Link>
          </div>

          <div className="p-4 border-t border-gray-100">
            <Link href="/dashboard/seller/settings" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive('/dashboard/seller/settings') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <Settings size={20} /> Store Settings
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-bold transition-colors mt-1">
              <LogOut size={20} /> Log Out
            </button>
          </div>
        </aside>

        {/* Dynamic Content Area */}
        <div className="flex-1 ml-0 md:ml-64 relative">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  )
}
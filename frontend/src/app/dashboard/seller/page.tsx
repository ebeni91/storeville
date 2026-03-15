'use client'

import { useAuthStore } from '@/store/authStore'
import { Package, ShoppingBag, TrendingUp, Clock, Plus } from 'lucide-react'
import Link from 'next/link'

export default function SellerDashboard() {
  const { user } = useAuthStore()

  // Display either the email or the phone number
  const identifier = user?.email || user?.phone_number

  return (
    <main className="p-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Dashboard</h1>
          <p className="text-gray-500 font-medium mt-1">Welcome back, {identifier}</p>
        </div>
        <Link 
          href="/dashboard/seller/products" 
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
        >
          <Plus size={20} /> Add New Product
        </Link>
      </header>

      {/* KPI Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 mb-1">Today's Sales</p>
            <h3 className="text-2xl font-black text-gray-900">Br 0.00</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 mb-1">Pending Orders</p>
            <h3 className="text-2xl font-black text-gray-900">0</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Package size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 mb-1">Active Products</p>
            <h3 className="text-2xl font-black text-gray-900">0</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
        </div>
        
        <div className="p-12 text-center text-gray-500 font-medium flex flex-col items-center">
          <ShoppingBag size={48} className="text-gray-200 mb-4" />
          <p>No orders yet. They will appear here once customers checkout.</p>
        </div>
      </div>
    </main>
  )
}
'use client'

import { authClient } from '@/lib/auth-client'
import { Package, ShoppingBag, TrendingUp, Clock, Plus } from 'lucide-react'
import Link from 'next/link'
import { motion, Variants } from 'framer-motion'

export default function SellerDashboard() {
  const { data: session } = authClient.useSession()
  const user = session?.user

  // Display either the email or the phone number
  const identifier = user?.email || (user as any)?.phone_number || 'Seller'

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  }

  return (
    <main className="p-4 md:p-8 lg:p-12 max-w-[1600px] mx-auto pb-32">
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 relative z-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mb-2">Dashboard</h1>
          <p className="text-gray-600 font-semibold text-lg">Welcome back, {identifier}</p>
        </div>
        <Link 
          href="/dashboard/seller/products" 
          className="bg-gray-900 text-white px-7 py-3.5 rounded-full text-sm font-black tracking-widest uppercase hover:bg-black hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)] transition-all flex items-center gap-2 transform hover:-translate-y-0.5 shadow-[0_8px_20px_rgba(0,0,0,0.12)]"
        >
          <Plus size={18} /> Add New Product
        </Link>
      </motion.header>

      {/* KPI Analytics Cards */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 relative z-10">
        
        <motion.div variants={itemVariants} className="group relative bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[2.5rem] p-8 overflow-hidden transition-all hover:bg-white cursor-pointer hover:border-emerald-200">
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 rounded-[1.25rem] bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <TrendingUp size={28} />
            </div>
            <div>
              <h3 className="text-4xl font-black text-gray-900 tracking-tighter leading-none mb-1">Br 0.00</h3>
              <p className="text-sm font-bold text-gray-500">Today's Sales</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="group relative bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[2.5rem] p-8 overflow-hidden transition-all hover:bg-white cursor-pointer hover:border-orange-200">
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 rounded-[1.25rem] bg-orange-100 text-orange-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <Clock size={28} />
            </div>
            <div>
              <h3 className="text-4xl font-black text-gray-900 tracking-tighter leading-none mb-1">0</h3>
              <p className="text-sm font-bold text-gray-500">Pending Orders</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="group relative bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[2.5rem] p-8 overflow-hidden transition-all hover:bg-white cursor-pointer hover:border-gray-200">
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 rounded-[1.25rem] bg-gray-100 text-gray-900 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <Package size={28} />
            </div>
            <div>
              <h3 className="text-4xl font-black text-gray-900 tracking-tighter leading-none mb-1">0</h3>
              <p className="text-sm font-bold text-gray-500">Active Products</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }} className="bg-white/70 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden relative z-10 w-full max-w-4xl">
        <div className="px-8 py-8 flex justify-between items-center relative z-10">
          <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900"><ShoppingBag size={22} className="text-gray-900" /> Recent Orders</h2>
        </div>
        
        <div className="px-12 pb-16 pt-8 text-center text-gray-500 font-medium flex flex-col items-center bg-white/40">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100 mb-5 text-gray-300">
            <ShoppingBag size={36} />
          </div>
          <p className="text-gray-900 font-bold mb-1">No orders yet.</p>
          <p className="text-xs">They will appear here once customers checkout.</p>
        </div>
      </motion.div>
    </main>
  )
}
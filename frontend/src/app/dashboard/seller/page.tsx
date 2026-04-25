'use client'

import { authClient } from '@/lib/auth-client'
import { Package, ShoppingBag, TrendingUp, Clock, Plus, Store, Crown, Zap, Star, ChevronRight, ClipboardList } from 'lucide-react'
import Link from 'next/link'
import { motion, Variants } from 'framer-motion'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

export default function SellerDashboard() {
  const { data: session } = authClient.useSession()
  const user = session?.user

  const identifier = user?.email || (user as any)?.phone_number || 'Seller'

  const [store, setStore] = useState<any>(null)
  const [stats, setStats] = useState({ sales: 0, pendingOrders: 0, activeItems: 0 })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storeRes = await api.get('/stores/manage/')
        const currentStore = storeRes.data?.results?.[0] || storeRes.data?.[0]
        
        if (currentStore) {
          setStore(currentStore)
          const isFood = currentStore.store_type === 'FOOD'
          const ordersPromise = api.get(isFood ? '/orders/food/' : '/orders/retail/')
          const itemsPromise = api.get(isFood ? `/food/items/?store_id=${currentStore.id}` : `/retail/products/?store_id=${currentStore.id}`)
          
          const [ordersRes, itemsRes] = await Promise.all([ordersPromise, itemsPromise])
          const orders = ordersRes.data?.results || ordersRes.data || []
          const items = itemsRes.data?.results || itemsRes.data || []
          
          const todayStr = new Date().toISOString().split('T')[0]
          const todaysSales = orders
            .filter((o: any) => o.created_at.startsWith(todayStr) && o.status !== 'CANCELLED')
            .reduce((sum: number, o: any) => sum + parseFloat(o.total_amount || o.total_price_with_delivery || 0), 0)
            
          const pending = orders.filter((o: any) => o.status === 'PENDING').length
          const activeItemCount = items.filter((i: any) => (isFood ? i.is_available : i.is_active)).length
          
          setStats({ sales: todaysSales, pendingOrders: pending, activeItems: activeItemCount })
          setRecentOrders(orders.slice(0, 5)) // Top 5 recent orders
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  }

  const isFood = store?.store_type === 'FOOD'
  const accentClass = isFood ? 'text-orange-600 bg-orange-100 hover:border-orange-200' : 'text-indigo-600 bg-indigo-100 hover:border-indigo-200'
  const iconColor = isFood ? 'text-orange-600' : 'text-indigo-600'
  const accentBgClass = isFood ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'

  return (
    <main className="p-4 md:p-8 lg:p-12 max-w-[1600px] mx-auto pb-32">
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-6 relative z-10 w-full">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">Dashboard</h1>
            {store?.subscription_plan && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl mt-1 ${
                store.subscription_plan === 'PRO' ? 'bg-gray-100 text-gray-900' : 
                store.subscription_plan === 'ELITE' ? 'bg-amber-100 text-amber-700' : 
                'bg-gray-50 text-gray-500'
              }`}>
                {store.subscription_plan === 'PRO' ? <Zap size={14} className="fill-current" /> : 
                 store.subscription_plan === 'ELITE' ? <Crown size={14} className="fill-current" /> : 
                 <Star size={14} className="fill-current" />}
                <span className="text-[11px] font-black tracking-widest uppercase">{store.subscription_plan}</span>
              </div>
            )}
          </div>
          <p className="text-gray-600 font-semibold text-sm md:text-lg">Welcome back, {identifier}</p>
        </div>
        <div className="flex flex-row md:flex-row items-center gap-3 w-full md:w-auto">
          <div className={`hidden sm:flex w-12 h-12 md:w-14 items-center justify-center md:h-14 rounded-2xl ${accentBgClass} shrink-0`}>
            <Store size={22} className="md:w-[26px] md:h-[26px]" />
          </div>
          <Link 
            href="/dashboard/seller/products" 
            className="w-full flex-1 md:w-auto bg-gray-900 text-white px-5 md:px-7 py-3.5 rounded-2xl md:rounded-full text-xs md:text-sm font-black tracking-widest uppercase hover:bg-black hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 shadow-[0_8px_15px_rgba(0,0,0,0.12)] whitespace-nowrap"
          >
            <Plus size={16} /> Add {isFood ? 'Dish' : 'Product'}
          </Link>
        </div>
      </motion.header>

      {/* KPI Analytics Cards */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 relative z-10">
        
        <motion.div variants={itemVariants} className="group relative bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 overflow-hidden transition-all hover:bg-white cursor-pointer hover:border-emerald-200">
          <div className="relative z-10 flex items-center gap-5 md:gap-6">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1rem] md:rounded-[1.25rem] bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform shrink-0">
              <TrendingUp size={24} className="md:w-7 md:h-7" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-black tracking-widest uppercase text-gray-400 mb-1">Today's Sales</p>
              <h3 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter leading-none">Br {stats.sales.toFixed(2)}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="group relative bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 overflow-hidden transition-all hover:bg-white cursor-pointer hover:border-orange-200">
          <div className="relative z-10 flex items-center gap-5 md:gap-6">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1rem] md:rounded-[1.25rem] bg-orange-100 text-orange-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform shrink-0">
              <Clock size={24} className="md:w-7 md:h-7" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-black tracking-widest uppercase text-gray-400 mb-1">Pending Orders</p>
              <h3 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter leading-none">{stats.pendingOrders}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className={`group relative bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 overflow-hidden transition-all hover:bg-white cursor-pointer ${accentClass.split(' ')[2]}`}>
          <div className="relative z-10 flex items-center gap-5 md:gap-6">
            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-[1rem] md:rounded-[1.25rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform shrink-0 ${accentBgClass}`}>
              <Package size={24} className="md:w-7 md:h-7" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-black tracking-widest uppercase text-gray-400 mb-1">Active {isFood ? 'Menu' : 'Products'}</p>
              <h3 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter leading-none">{stats.activeItems}</h3>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }} className="lg:col-span-2 bg-white/70 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden relative z-10">
          <div className="px-8 py-8 flex justify-between items-center relative z-10 border-b border-gray-100">
            <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900"><ShoppingBag size={22} className="text-gray-900" /> Recent Orders</h2>
            <Link href="/dashboard/seller/orders" className="text-xs font-black tracking-widest uppercase text-gray-500 hover:text-gray-900 transition-colors">View All</Link>
          </div>
          
          <div className="p-8">
            {recentOrders.length === 0 ? (
              <div className="pb-16 pt-8 text-center text-gray-500 font-medium flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100 mb-5 text-gray-300">
                  <ShoppingBag size={36} />
                </div>
                <p className="text-gray-900 font-bold mb-1">No orders yet.</p>
                <p className="text-xs">They will appear here once customers checkout.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order, i) => (
                  <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-[1.25rem] md:rounded-[1.5rem] border border-gray-100 hover:border-gray-200 hover:bg-white transition-all gap-3">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        order.status === 'PENDING' ? 'bg-orange-50 text-orange-600' :
                        order.status === 'DELIVERED' ? 'bg-green-50 text-green-600' :
                        'bg-gray-50 text-gray-600'
                      }`}>
                        <ShoppingBag size={18} className="md:w-5 md:h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm md:text-base">Order #{order.id.substring(0,6).toUpperCase()}</h4>
                        <p className="text-[10px] md:text-xs font-semibold text-gray-500 mt-0.5">{new Date(order.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="sm:text-right flex sm:block items-center justify-between w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t border-gray-50 sm:border-t-0">
                      <p className="font-black text-base md:text-lg text-gray-900">Br {parseFloat(order.total_amount || order.total_price_with_delivery || 0).toFixed(2)}</p>
                      <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest ${
                        order.status === 'PENDING' ? 'text-orange-600' :
                        order.status === 'DELIVERED' ? 'text-green-600' :
                        'text-gray-500'
                      }`}>{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Links / Mobile Style Links Sidebar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }} className="space-y-4 relative z-10 w-full">
          <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-6 text-sm">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 px-2">Store Management</h2>
            
            <Link href="/dashboard/seller/studio" className="flex items-center justify-between p-5 rounded-2xl hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all group mb-2">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                  <Store size={18} className="text-gray-600" />
                </div>
                <span className="font-bold text-gray-900 text-[15px]">Store Profile Setup</span>
              </div>
              <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
            </Link>

            <Link href="/dashboard/seller/orders" className="flex items-center justify-between p-5 rounded-2xl hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                  <ClipboardList size={18} className="text-gray-600" />
                </div>
                <span className="font-bold text-gray-900 text-[15px]">Fulfillment Hub</span>
              </div>
              <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
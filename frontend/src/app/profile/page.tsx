'use client'
import React, { useEffect, useState } from 'react'
import { motion, Variants } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { 
  ShoppingBag, Heart, MapPin, Settings, ChevronRight, 
  Package, Clock, CheckCircle, CreditCard, Lock, User, Plus,Truck,AlertCircle, X
} from 'lucide-react'
import Link from 'next/link'

import AddressModal from '@/components/profile/AddressModal'
import ProfileModal from '@/components/profile/ProfileModal'
import PaymentModal from '@/components/profile/PaymentModal'
import OrderDetailsModal from '@/components/profile/OrderDetailsModal'

// Quick fetchers handling DRF pagination (.results)
const fetchAddresses = async () => { const res = await api.get('/accounts/addresses/'); return res.data.results || res.data; }
const fetchPaymentMethods = async () => { const res = await api.get('/accounts/payment-methods/'); return res.data.results || res.data; }
const fetchRetailFavorites = async () => { const res = await api.get('/retail/favorites/'); return res.data.results || res.data; }
const fetchFoodFavorites = async () => { const res = await api.get('/food/favorites/'); return res.data.results || res.data; }
const fetchRetailOrders = async () => { const res = await api.get('/orders/retail/'); return res.data.results || res.data; }
const fetchFoodOrders = async () => { const res = await api.get('/orders/food/'); return res.data.results || res.data; }

export default function BuyerDashboard() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const user = session?.user
  const [isMounted, setIsMounted] = useState(false)
  const queryClient = useQueryClient()

  // Modals state
  const [isAddressModalOpen, setAddressModalOpen] = useState(false)
  const [addressToEdit, setAddressToEdit] = useState(null)
  
  const [isProfileModalOpen, setProfileModalOpen] = useState(false)
  
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false)
  const [paymentToEdit, setPaymentToEdit] = useState(null)

  const [isOrderModalOpen, setOrderModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    setIsMounted(true)
    if (isMounted && !isPending && !session) {
      router.push('/login')
    }
  }, [session, isPending, router, isMounted])

  // Queries
  const { data: addresses = [] } = useQuery({ queryKey: ['addresses'], queryFn: fetchAddresses, enabled: !!session })
  const { data: paymentMethods = [] } = useQuery({ queryKey: ['paymentMethods'], queryFn: fetchPaymentMethods, enabled: !!session })
  const { data: retailFavorites = [] } = useQuery({ queryKey: ['retailFavorites'], queryFn: fetchRetailFavorites, enabled: !!session })
  const { data: foodFavorites = [] } = useQuery({ queryKey: ['foodFavorites'], queryFn: fetchFoodFavorites, enabled: !!session })
  const { data: retailOrders = [] } = useQuery({ queryKey: ['retailOrders'], queryFn: fetchRetailOrders, enabled: !!session })
  const { data: foodOrders = [] } = useQuery({ queryKey: ['foodOrders'], queryFn: fetchFoodOrders, enabled: !!session })

  // Mutations
  const removeRetailFav = useMutation({
    mutationFn: (id) => api.delete(`/retail/favorites/${id}/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['retailFavorites'] })
  })
  const removeFoodFav = useMutation({
    mutationFn: (id) => api.delete(`/food/favorites/${id}/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['foodFavorites'] })
  })

  if (!isMounted || !session) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div></div>

  const displayName = user?.name || 'Member'

  // Data Processing
  const allWishlist: any[] = [
    ...retailFavorites.map((f: any) => ({ 
      id: f.id, rawId: f.id, name: f.product_details.name, price: `ETB ${f.product_details.price}`, type: 'retail', icon: ShoppingBag, storeName: f.product_details?.store_name, storeSlug: f.product_details?.store_slug
    })),
    ...foodFavorites.map((f: any) => ({ 
      id: f.id, rawId: f.id, name: f.menu_item_details.name, price: `ETB ${f.menu_item_details.price}`, type: 'food', icon: Heart, storeName: f.menu_item_details?.store_name, storeSlug: f.menu_item_details?.store_slug
    }))
  ]

  const allOrders = [
    ...retailOrders.map((o: any) => ({ id: o.id.substring(0, 8).toUpperCase(), rawId: o.id, rawDate: new Date(o.created_at), date: new Date(o.created_at).toLocaleDateString(), total: `ETB ${o.total_price_with_delivery || o.total_price}`, status: o.status.toLowerCase(), type: 'retail' })),
    ...foodOrders.map((o: any) => ({ id: o.id.substring(0, 8).toUpperCase(), rawId: o.id, rawDate: new Date(o.created_at), date: new Date(o.created_at).toLocaleDateString(), total: `ETB ${o.total_price_with_delivery || o.total_price}`, status: o.status.toLowerCase(), type: 'food' }))
  ].sort((a,b) => b.rawDate.getTime() - a.rawDate.getTime()).slice(0, 5)

  const primaryAddress = addresses.find((a: any) => a.is_primary) || addresses[0]
  
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  }

  return (
    <main className="min-h-screen relative font-sans text-gray-900 overflow-x-hidden selection:bg-gray-900 selection:text-white pb-20">
      
      <AddressModal isOpen={isAddressModalOpen} onClose={() => setAddressModalOpen(false)} addressToEdit={addressToEdit} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setProfileModalOpen(false)} />
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setPaymentModalOpen(false)} paymentToEdit={paymentToEdit} />
      <OrderDetailsModal isOpen={isOrderModalOpen} onClose={() => setOrderModalOpen(false)} order={selectedOrder} />

      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 bg-gray-50">
        <div className="absolute inset-0 opacity-[0.4] mix-blend-overlay bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        
        {/* Navigation / Back */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm font-black text-gray-900 hover:text-black transition-colors bg-white/50 backdrop-blur-xl px-4 py-2 rounded-full shadow-sm border border-white/60">
            ← Back to StoreVille Base
          </Link>
        </motion.div>

        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gray-900 p-[3px] shadow-[0_10px_40px_rgba(17,24,39,0.3)]">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <span className="text-3xl font-black text-gray-900">{displayName.charAt(0).toUpperCase()}</span>
              </div>
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-gray-900 mb-2">Welcome back, {displayName}</h1>
              <p className="text-gray-600 font-semibold text-lg max-w-xl">Manage your orders and account settings across all StoreVille networks.</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { label: 'Total Orders', value: retailOrders.length + foodOrders.length, icon: ShoppingBag, color: 'text-gray-900', bg: 'bg-gray-100', hoverborder: 'hover:border-gray-200' },
              { label: 'Saved Wishlist', value: allWishlist.length, icon: Heart, color: 'text-pink-600', bg: 'bg-pink-100', hoverborder: 'hover:border-pink-200' },
              { label: 'Addresses', value: addresses.length, icon: MapPin, color: 'text-emerald-600', bg: 'bg-emerald-100', hoverborder: 'hover:border-emerald-200' },
            ].map((stat, i) => (
              <motion.div key={i} variants={itemVariants} className={`group relative bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] p-7 overflow-hidden hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all cursor-pointer ${stat.hoverborder}`}>
                <div className="relative z-10 flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-4xl font-black text-gray-900 tracking-tighter leading-none mb-1">{stat.value}</h3>
                    <p className="text-sm font-bold text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: Orders & Addresses */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Recent Orders */}
              <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900"><Package size={22} className="text-gray-900" /> Recent Orders</h2>
                  <button className="text-sm font-black tracking-wide uppercase text-gray-900 hover:text-black transition-colors">View All</button>
                </div>
                
                <div className="space-y-4">
                  {allOrders.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 font-bold">No orders found.</div>
                  ) : allOrders.map((order, i) => (
                    <div 
                      key={i} 
                      onClick={() => { setSelectedOrder(order); setOrderModalOpen(true); }}
                      className="group p-5 rounded-3xl bg-white/50 border border-gray-100 hover:border-gray-200 hover:bg-white hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden cursor-pointer"
                    >
                      {/* Gateway Badge */}
                      <div className="flex items-center gap-5 relative z-10">
                        <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center border shadow-sm ${
                          order.type === 'food' 
                            ? 'bg-orange-50 text-orange-600 border-orange-100' 
                            : 'bg-gray-50 text-gray-900 border-gray-200'
                        }`}>
                          {order.type === 'food' ? <span className="font-black text-xl">F</span> : <span className="font-black text-xl">R</span>}
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-gray-900 group-hover:text-gray-600 transition-colors">ORD-{order.id}</h4>
                          <p className="text-xs font-semibold text-gray-500 mt-0.5">{order.date}</p>
                        </div>
                      </div>

                      {/* Status & Price */}
                      <div className="flex items-center justify-between sm:justify-end gap-8 relative z-10">
                        <div className="text-right">
                          <p className="font-black text-gray-900 text-lg">{order.total}</p>
                          <span className={`inline-flex items-center justify-end gap-1.5 mt-1 text-[10px] font-black uppercase tracking-widest ${
                            order.status === 'delivered' ? 'text-emerald-600' : 
                            order.status === 'shipped' || order.status === 'dispatched' ? 'text-blue-600' : 
                            order.status === 'cancelled' ? 'text-red-600' :
                            'text-orange-600'
                          }`}>
                            {order.status === 'delivered' ? <CheckCircle size={12} /> : 
                             order.status === 'cancelled' ? <AlertCircle size={12} /> : 
                             order.status === 'shipped' || order.status === 'dispatched' ? <Truck size={12} /> :
                             <Clock size={12} />}
                            {order.status}
                          </span>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-400 group-hover:text-gray-900 border border-gray-100 group-hover:border-gray-200 shadow-sm">
                          <ChevronRight size={20} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Saved Addresses */}
              <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900"><MapPin size={22} className="text-emerald-600" /> Saved Addresses</h2>
                  <button 
                    onClick={() => { setAddressToEdit(null); setAddressModalOpen(true); }}
                    className="text-sm font-black tracking-wide uppercase text-emerald-600 hover:text-emerald-800 transition-colors flex items-center gap-1"
                  >
                    <Plus size={16} /> Add New
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {primaryAddress ? (
                    <div className="p-6 rounded-[2rem] bg-white border border-gray-100 shadow-sm flex flex-col justify-between min-h-[160px] relative overflow-hidden group hover:border-emerald-200 transition-colors">
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Primary</span>
                        </div>
                        <p className="font-black text-gray-900 text-lg mb-1">{primaryAddress.label}</p>
                        <p className="text-sm font-semibold text-gray-500 leading-relaxed">{primaryAddress.street_address}<br/>{primaryAddress.city_subcity}</p>
                      </div>
                      <button 
                        onClick={() => { setAddressToEdit(primaryAddress); setAddressModalOpen(true); }}
                        className="text-xs font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors mt-6 self-start flex items-center gap-1 relative z-10"
                      >
                        <MapPin size={12}/> Edit Address
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 rounded-[2rem] bg-white border border-gray-100 shadow-sm flex flex-col justify-center items-center cursor-pointer group hover:border-emerald-200 text-center min-h-[160px]">
                      <p className="text-sm font-bold text-gray-500">No primary address set.</p>
                    </div>
                  )}
                  
                  <div 
                    onClick={() => { setAddressToEdit(null); setAddressModalOpen(true); }}
                    className="p-6 rounded-[2rem] bg-white/50 border-2 border-dashed border-gray-200 hover:border-gray-300 hover:bg-white flex flex-col justify-center items-center gap-4 text-gray-500 hover:text-gray-700 transition-all cursor-pointer min-h-[160px] group shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center transition-colors border border-gray-100"><MapPin size={20} /></div>
                    <span className="text-sm font-black tracking-wide">Add New Address</span>
                  </div>
                </div>
              </motion.div>

            </div>

            {/* RIGHT COLUMN: Wishlist & Settings */}
            <div className="space-y-8">
              
              {/* Settings Snippet */}
              <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[2.5rem] p-8 relative overflow-hidden">
                <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900 mb-8 relative z-10"><Settings size={22} className="text-gray-900" /> Account</h2>
                
                <div className="space-y-4 relative z-10">
                  <button onClick={() => setProfileModalOpen(true)} className="w-full flex items-center justify-between p-5 rounded-[1.5rem] bg-white/50 hover:bg-white shadow-sm transition-all border border-gray-100 hover:border-gray-200 group">
                    <div className="flex items-center gap-4 text-sm font-bold text-gray-900"><User size={20} className="text-gray-900 group-hover:scale-110 transition-transform" /> Profile Information</div>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
                  </button>
                  <button onClick={() => { setPaymentToEdit(null); setPaymentModalOpen(true); }} className="w-full flex items-center justify-between p-5 rounded-[1.5rem] bg-white/50 hover:bg-white shadow-sm transition-all border border-gray-100 hover:border-gray-200 group">
                    <div className="flex items-center gap-4 text-sm font-bold text-gray-900"><CreditCard size={20} className="text-gray-900 group-hover:scale-110 transition-transform" /> Payment Methods</div>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
                  </button>
                  <button className="w-full flex items-center justify-between p-5 rounded-[1.5rem] bg-white/50 hover:bg-white shadow-sm transition-all border border-gray-100 hover:border-gray-200 group">
                    <div className="flex items-center gap-4 text-sm font-bold text-gray-900"><Lock size={20} className="text-gray-900 group-hover:scale-110 transition-transform" /> Security Settings</div>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
                  </button>
                </div>
              </motion.div>

              {/* Wishlist Preview */}
              <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-8 relative overflow-hidden">
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900"><Heart size={22} className="text-pink-600" /> Wishlist</h2>
                  <button className="text-sm font-black tracking-wide uppercase text-pink-600 hover:text-pink-800 transition-colors">View All</button>
                </div>
                
                <div className="space-y-5 relative z-10">
                  {allWishlist.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 font-bold text-sm">No items saved yet.</div>
                  ) : allWishlist.map((item, i) => (
                    <div key={i} className="group flex items-center gap-4 p-2 -m-2 rounded-[1.5rem] hover:bg-white transition-colors">
                      <div className="w-16 h-16 rounded-[1.25rem] bg-gray-50 border border-gray-100 group-hover:border-pink-200 flex-shrink-0 relative overflow-hidden transition-colors flex items-center justify-center shadow-sm">
                        <item.icon size={20} className="text-pink-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-gray-900 truncate group-hover:text-pink-600 transition-colors cursor-pointer">{item.name}</h4>
                        {item.storeName && item.storeSlug && (
                          <Link href={`/store/${item.storeSlug}`} className="text-[10px] font-semibold text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-1 mt-0.5 w-fit">
                            From: {item.storeName}
                          </Link>
                        )}
                        <p className="text-xs font-black text-gray-500 mt-1">{item.price}</p>
                      </div>
                      <button 
                        onClick={() => {
                          if (item.type === 'retail') removeRetailFav.mutate(item.rawId)
                          else removeFoodFav.mutate(item.rawId)
                        }}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                  
                  <button className="w-full mt-4 py-4.5 p-3 rounded-[1.25rem] bg-white/50 border-2 border-dashed border-gray-200 text-sm font-black tracking-widest uppercase text-gray-500 hover:text-gray-900 hover:bg-white hover:border-gray-300 transition-all shadow-sm">
                    Browse Catalog
                  </button>
                </div>
              </motion.div>
              
            </div>
          </div>
        </motion.div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
      `}} />
    </main>
  )
}

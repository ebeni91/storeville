'use client'
import React, { useEffect, useState, Suspense } from 'react'
import { motion, Variants } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { 
  ShoppingBag, Heart, MapPin, Settings, ChevronRight, 
  Package, Clock, CheckCircle, CreditCard, Lock, User, Plus,Truck,AlertCircle, X,
  LayoutDashboard, Headphones, Trash2, Send,AlertTriangle, ArrowLeft, Search
} from 'lucide-react'
import Link from 'next/link'

import OrderDetailsModal from '@/components/profile/OrderDetailsModal'
import TrackOrderTab from '@/components/profile/TrackOrderTab'

// Quick fetchers handling DRF pagination (.results)
const fetchAddresses = async () => { const res = await api.get('/accounts/addresses/'); return res.data.results || res.data; }
const fetchPaymentMethods = async () => { const res = await api.get('/accounts/payment-methods/'); return res.data.results || res.data; }
const fetchRetailFavorites = async () => { const res = await api.get('/retail/favorites/'); return res.data.results || res.data; }
const fetchFoodFavorites = async () => { const res = await api.get('/food/favorites/'); return res.data.results || res.data; }
const fetchRetailOrders = async () => { const res = await api.get('/orders/retail/'); return res.data.results || res.data; }
const fetchFoodOrders = async () => { const res = await api.get('/orders/food/'); return res.data.results || res.data; }

type TabItem = 'overview' | 'shipping' | 'payment' | 'service' | 'account' | 'track_order'

export default function BuyerDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div></div>}>
      <BuyerDashboardContent />
    </Suspense>
  )
}

function BuyerDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, isPending } = authClient.useSession()
  const user = session?.user
  const [isMounted, setIsMounted] = useState(false)
  const queryClient = useQueryClient()

  // Tab state
  const [activeTab, setActiveTab] = useState<TabItem>('overview')
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false)

  // Account Settings Form State
  const [accountFormData, setAccountFormData] = useState({ name: '', email: '', phone: '' })
  const [addressFormData, setAddressFormData] = useState({ contact_name: '', phone_number: '', address_line1: '', address_line2: '', city: '', state: '', zip_code: '' })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Orders Modal State
  const [isOrderModalOpen, setOrderModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    setIsMounted(true)
    if (isMounted && !isPending && !session) {
      router.push('/login')
    }
  }, [session, isPending, router, isMounted])

  useEffect(() => {
    const tabQuery = searchParams.get('tab') as TabItem
    if (tabQuery && ['overview', 'shipping', 'payment', 'service', 'account', 'track_order'].includes(tabQuery)) {
      setActiveTab(tabQuery)
    }
  }, [searchParams])

  // Queries
  const { data: addresses = [] } = useQuery({ queryKey: ['addresses'], queryFn: fetchAddresses, enabled: !!session })
  const { data: profile = null } = useQuery({ queryKey: ['profile'], queryFn: async () => { const res = await api.get('/accounts/profile/'); return res.data }, enabled: !!session })
  const { data: retailFavorites = [] } = useQuery({ queryKey: ['retailFavorites'], queryFn: fetchRetailFavorites, enabled: !!session })
  const { data: foodFavorites = [] } = useQuery({ queryKey: ['foodFavorites'], queryFn: fetchFoodFavorites, enabled: !!session })
  const { data: retailOrders = [] } = useQuery({ queryKey: ['retailOrders'], queryFn: fetchRetailOrders, enabled: !!session })
  const { data: foodOrders = [] } = useQuery({ queryKey: ['foodOrders'], queryFn: fetchFoodOrders, enabled: !!session })

  // Sync session user data into form
  useEffect(() => {
    if (user || profile) {
      const fallbackName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()
      setAccountFormData({ 
        name: user?.name || fallbackName || '', 
        email: user?.email || profile?.email || '', 
        phone: profile?.phone_number || '' 
      })
    }
    if (addresses && addresses.length > 0) {
      const a = addresses[0]
      setAddressFormData({
        contact_name: a.contact_name || '',
        phone_number: a.phone_number || '',
        address_line1: a.address_line1 || '',
        address_line2: a.address_line2 || '',
        city: a.city || '',
        state: a.state || '',
        zip_code: a.zip_code || ''
      })
    }
  }, [user, profile, addresses])


  // Mutations
  const removeRetailFav = useMutation({
    mutationFn: (id) => api.delete(`/retail/favorites/${id}/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['retailFavorites'] })
  })
  const removeFoodFav = useMutation({
    mutationFn: (id) => api.delete(`/food/favorites/${id}/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['foodFavorites'] })
  })

  // Account Settings Mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      // First update django backend if needed
      await api.patch(`/accounts/profile/`, { 
        first_name: data.name.split(' ')[0], 
        last_name: data.name.split(' ').slice(1).join(' '),
        phone_number: data.phone
      }).catch(() => {}) // Silently omit failures here for now
      
      const { data: updatedUser, error } = await authClient.updateUser({
        name: data.name,
        // Depending on email provider configs you might use changeEmail
      })
      if (error) throw error
      return updatedUser
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      alert('Profile updated successfully!')
    }
  })

  // Shipping Address Mutation
  const updateAddressMutation = useMutation({
    mutationFn: async (data: any) => {
      if (addresses && addresses.length > 0) {
        await api.patch(`/accounts/addresses/${addresses[0].id}/`, data)
      } else {
        await api.post(`/accounts/addresses/`, data)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      alert('Shipping Address updated successfully!')
    }
  })

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/accounts/profile/`).catch(() => {}) 
      const { error } = await authClient.deleteUser()
      if (error) throw error
    },
    onSuccess: async () => {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => router.push('/')
        }
      })
    }
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
    ...retailOrders.map((o: any) => ({ id: o.id.substring(0, 8).toUpperCase(), rawId: o.id, rawDate: new Date(o.created_at), date: new Date(o.created_at).toLocaleDateString(), total: `ETB ${o.total_amount || 0}`, status: o.status.toLowerCase(), type: 'retail' })),
    ...foodOrders.map((o: any) => ({ id: o.id.substring(0, 8).toUpperCase(), rawId: o.id, rawDate: new Date(o.created_at), date: new Date(o.created_at).toLocaleDateString(), total: `ETB ${o.total_amount || 0}`, status: o.status.toLowerCase(), type: 'food' }))
  ].sort((a,b) => b.rawDate.getTime() - a.rawDate.getTime()).slice(0, 5)
  
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  }

  const navTabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'track_order', label: 'Track Order', icon: Search },
    { id: 'shipping', label: 'Shipping address', icon: MapPin },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'service', label: 'Customer service', icon: Headphones },
    { id: 'account', label: 'Account settings', icon: Settings }
  ]

  return (
    <main className="min-h-screen relative font-sans text-gray-900 overflow-x-hidden selection:bg-gray-900 selection:text-white pb-20">
      <OrderDetailsModal isOpen={isOrderModalOpen} onClose={() => setOrderModalOpen(false)} order={selectedOrder} />

      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 bg-gray-50">
        <div className="absolute inset-0 opacity-[0.4] mix-blend-overlay bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="flex items-center gap-5">
            <Link href="/" className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 hover:scale-105 transition-all shadow-sm group flex-shrink-0">
              <ArrowLeft size={24} className="text-gray-900 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-gray-900 mb-1 sm:mb-2">Welcome back, {displayName}</h1>
              <p className="text-gray-600 font-semibold text-sm sm:text-lg max-w-xl">Manage your orders and account settings across all StoreVille networks.</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
          
          {/* Stats Grid */}
          <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-3 gap-5 snap-x hide-scrollbar">
            {[
              { label: 'Total Orders', value: retailOrders.length + foodOrders.length, icon: ShoppingBag, color: 'text-gray-900', bg: 'bg-gray-100', hoverborder: 'hover:border-gray-200' },
              { label: 'Saved Wishlist', value: allWishlist.length, icon: Heart, color: 'text-pink-600', bg: 'bg-pink-100', hoverborder: 'hover:border-pink-200' },
              { label: 'Addresses', value: addresses.length, icon: MapPin, color: 'text-emerald-600', bg: 'bg-emerald-100', hoverborder: 'hover:border-emerald-200' },
            ].map((stat, i) => (
              <motion.div key={i} variants={itemVariants} className={`min-w-[85vw] sm:min-w-0 snap-center flex-shrink-0 group relative bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] p-7 overflow-hidden hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all cursor-pointer ${stat.hoverborder}`}>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* left COLUMN: Sidebar Navigation & Wishlist */}
            <div className={`space-y-8 sticky top-8 ${isMobileDetailOpen ? 'hidden lg:block' : 'block'}`}>
              
              {/* Account Navigation Snippet */}
              <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[2.5rem] p-6 relative overflow-hidden">
                <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900 mb-6 px-2 relative z-10">
                  <User size={22} className="text-gray-900" /> Account
                </h2>
                
                <div className="space-y-2 relative z-10">
                  {navTabs.map((tab) => (
                    <button 
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id as TabItem); setIsMobileDetailOpen(true); }} 
                      className={`w-full flex items-center justify-between px-5 py-4 rounded-[1.25rem] transition-all border group ${
                        activeTab === tab.id 
                          ? 'bg-gray-900 text-white border-gray-900 shadow-md' 
                          : 'bg-transparent border-transparent hover:bg-white/50 hover:border-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-4 text-sm font-bold">
                        <tab.icon size={20} className={`${activeTab === tab.id ? 'text-white' : 'text-gray-500 group-hover:scale-110'} transition-transform`} /> 
                        {tab.label}
                      </div>
                      <ChevronRight size={18} className={activeTab === tab.id ? 'text-gray-400' : 'text-gray-300 group-hover:text-gray-500 transition-colors'} />
                    </button>
                  ))}
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

            {/* right COLUMN: Dynamic Tab Content */}
            <div className={`lg:col-span-2 space-y-8 ${!isMobileDetailOpen ? 'hidden lg:block' : 'block'}`}>
              
              {/* Mobile Back to Menu */}
              <div className="lg:hidden">
                <button 
                  onClick={() => setIsMobileDetailOpen(false)} 
                  className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm transition-colors"
                >
                  <ArrowLeft size={16} /> Back to menu
                </button>
              </div>
              
              {/* === OVERVIEW TAB === */}
              {activeTab === 'overview' && (
                <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-900"><Package size={26} className="text-gray-900" /> Recent Orders</h2>
                    <button className="text-sm font-black tracking-wide uppercase text-gray-900 hover:text-black transition-colors">View All</button>
                  </div>
                  
                  <div className="space-y-4">
                    {allOrders.length === 0 ? (
                      <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 text-gray-400 font-bold">No orders found.</div>
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
              )}

              {/* === TRACK ORDER TAB === */}
              {activeTab === 'track_order' && (
                <TrackOrderTab variants={itemVariants} />
              )}

              {/* === SHIPPING ADDRESS TAB === */}
              {activeTab === 'shipping' && (
                <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-8">
                  <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-900 mb-8"><MapPin size={26} className="text-emerald-600" /> Shipping address</h2>
                  
                  <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
                    <form onSubmit={(e) => { e.preventDefault(); updateAddressMutation.mutate(addressFormData); }} className="space-y-8">
                      {/* Country/region */}
                      <div className="space-y-3">
                        <label className="text-[14px] font-bold text-gray-900">Country/region</label>
                        <div className="relative w-full sm:max-w-[300px]">
                          <div className="px-4 py-3 bg-white border border-gray-300 rounded-lg flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-3">
                              <span className="text-lg leading-none">🇪🇹</span>
                              <span className="text-sm font-medium text-gray-700">Ethiopia</span>
                            </div>
                            <ChevronRight size={16} className="text-gray-400 rotate-90" />
                          </div>
                        </div>
                      </div>

                      {/* Contact information */}
                      <div className="space-y-3 pt-2">
                        <label className="text-[14px] font-bold text-gray-900">Contact information</label>
                        <div className="flex flex-col sm:flex-row gap-5">
                          <div className="flex-1 space-y-2">
                            <input type="text" value={addressFormData.contact_name} onChange={e => setAddressFormData({...addressFormData, contact_name: e.target.value})} placeholder="Contact name*" className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-[#fe5114] focus:ring-1 focus:ring-[#fe5114] outline-none transition-colors" />
                            <p className="text-[13px] text-gray-500">Please enter a contact name.</p>
                          </div>
                          <div className="flex-1 flex border border-gray-300 rounded-lg bg-white focus-within:border-[#fe5114] focus-within:ring-1 focus-within:ring-[#fe5114] transition-colors overflow-hidden h-[46px]">
                            <div className="px-4 py-3 border-r border-gray-300 text-sm font-semibold text-gray-800 bg-[#fbfbfb] flex items-center">+251</div>
                            <input type="text" value={addressFormData.phone_number} onChange={e => setAddressFormData({...addressFormData, phone_number: e.target.value})} placeholder="Mobile number*" className="flex-1 w-full px-4 py-3 text-sm bg-white outline-none" />
                          </div>
                        </div>
                      </div>

                      {/* Address */}
                      <div className="space-y-3 pt-2">
                        <label className="text-[14px] font-bold text-gray-900">Address</label>
                        <div className="flex flex-col sm:flex-row gap-5">
                          <input type="text" value={addressFormData.address_line1} onChange={e => setAddressFormData({...addressFormData, address_line1: e.target.value})} placeholder="Street, house/apartment/unit*" className="flex-1 px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-[#fe5114] focus:ring-1 focus:ring-[#fe5114] outline-none" />
                          <input type="text" value={addressFormData.address_line2} onChange={e => setAddressFormData({...addressFormData, address_line2: e.target.value})} placeholder="Apt, suite, unit, etc (optional )" className="flex-1 px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-[#fe5114] focus:ring-1 focus:ring-[#fe5114] outline-none" />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-5">
                          <input type="text" value={addressFormData.state} onChange={e => setAddressFormData({...addressFormData, state: e.target.value})} placeholder="State/Province*" className="flex-1 px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-[#fe5114] focus:ring-1 focus:ring-[#fe5114] outline-none" />
                          <input type="text" value={addressFormData.city} onChange={e => setAddressFormData({...addressFormData, city: e.target.value})} placeholder="City*" className="flex-1 px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-[#fe5114] focus:ring-1 focus:ring-[#fe5114] outline-none" />
                          <input type="text" value={addressFormData.zip_code} onChange={e => setAddressFormData({...addressFormData, zip_code: e.target.value})} placeholder="ZIP code*" className="flex-1 px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-[#fe5114] focus:ring-1 focus:ring-[#fe5114] outline-none" />
                        </div>
                      </div>

                      <label className="flex items-center gap-3 cursor-pointer group mt-6 pt-2 w-fit">
                        <div className="w-5 h-5 rounded-[4px] border border-gray-300 group-hover:border-[#fe5114] bg-white flex items-center justify-center transition-colors"></div>
                        <span className="text-[14px] text-gray-900">Set as default shipping address</span>
                      </label>

                      <div className="flex gap-4 pt-6">
                        <button type="submit" disabled={updateAddressMutation.isPending} className="px-10 py-3 bg-[#fe5114] hover:bg-[#eb4a10] text-white font-bold rounded-full text-[15px] transition-colors shadow-sm disabled:opacity-50">
                          {updateAddressMutation.isPending ? 'Saving...' : 'Confirm'}
                        </button>
                        <button type="button" className="px-10 py-3 bg-white border border-gray-300 hover:bg-gray-50 font-bold text-gray-900 rounded-full text-[15px] transition-colors shadow-sm">Cancel</button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}

              {/* === PAYMENT TAB === */}
              {activeTab === 'payment' && (
                <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <CreditCard size={40} className="text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 mb-2">Payment Methods</h2>
                  <p className="text-gray-500 font-semibold max-w-sm">Secure wallet and payment management is coming soon to the StoreVille base.</p>
                  <span className="mt-6 uppercase tracking-widest text-xs font-black text-[#fe5114] bg-orange-50 px-4 py-1.5 rounded-full border border-orange-100">Development Preview</span>
                </motion.div>
              )}

              {/* === CUSTOMER SERVICE TAB === */}
              {activeTab === 'service' && (
                <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-8 h-[600px] flex flex-col">
                  <div className="flex items-center gap-4 border-b border-gray-100 pb-6 mb-6">
                    <div className="w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center relative">
                      <Headphones size={24} className="text-white" />
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-[3px] border-white"></div>
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-gray-900">StoreVille Support</h2>
                      <p className="text-sm font-semibold text-emerald-600">Online • We typically reply in 5 mins</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 bg-white rounded-3xl border border-gray-100 p-6 flex flex-col justify-end space-y-4 mb-4 shadow-inner overflow-hidden relative">
                    <div className="flex flex-col gap-1 items-start w-3/4">
                      <div className="bg-gray-100 text-gray-800 px-5 py-3 rounded-2xl rounded-tl-sm text-sm font-semibold inline-block">
                        Hello {displayName.split(' ')[0]}! Welcome to StoreVille support. How can we assist you today?
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold ml-1">10:02 AM</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <input type="text" placeholder="Type your message..." className="flex-1 px-6 py-4 bg-white border border-gray-200 rounded-full text-sm font-semibold focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 shadow-sm" />
                    <button className="w-14 h-14 rounded-full bg-gray-900 hover:bg-black text-white flex items-center justify-center transition-all shadow-md">
                      <Send size={20} className="ml-1" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* === ACCOUNT SETTINGS TAB === */}
              {activeTab === 'account' && (
                <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-8">
                  <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-900 mb-8"><Settings size={26} className="text-gray-900" /> Account settings</h2>
                  
                  {showDeleteConfirm ? (
                    <div className="bg-red-50 border border-red-100 p-10 rounded-3xl text-center max-w-lg mx-auto">
                      <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
                      <h3 className="text-2xl font-black text-red-700 mb-3">Delete your account?</h3>
                      <p className="text-base text-red-600 mb-8 font-semibold">This action is permanent and cannot be undone. All your orders, payments, and wishlists will be wiped completely from our servers.</p>
                      <div className="flex gap-4">
                        <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-white text-gray-700 font-bold py-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">Cancel</button>
                        <button onClick={() => deleteAccountMutation.mutate()} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-600/30 transition-colors disabled:opacity-50">Confirm Deletion</button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={(e) => { e.preventDefault(); updateProfileMutation.mutate(accountFormData) }} className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm max-w-2xl">
                      <div className="space-y-6">
                        
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2">Personal information</label>
                          <input 
                            required 
                            type="text" 
                            name="name"
                            value={accountFormData.name} 
                            onChange={e => setAccountFormData({...accountFormData, name: e.target.value})} 
                            className="w-full px-5 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-1 focus:border-gray-900 focus:ring-gray-900 transition-all font-semibold text-sm" 
                            placeholder="Full Name" 
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2">Email address</label>
                          <input 
                            required 
                            type="email" 
                            name="email"
                            value={accountFormData.email} 
                            onChange={e => setAccountFormData({...accountFormData, email: e.target.value})} 
                            className="w-full px-5 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-1 focus:border-gray-900 focus:ring-gray-900 transition-all font-semibold text-sm" 
                            placeholder="Email Address" 
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2">Phone number (Optional)</label>
                          <input 
                            type="tel" 
                            name="phone"
                            value={accountFormData.phone} 
                            onChange={e => setAccountFormData({...accountFormData, phone: e.target.value})} 
                            className="w-full px-5 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-1 focus:border-gray-900 focus:ring-gray-900 transition-all font-semibold text-sm" 
                            placeholder="+251 911 000000" 
                          />
                        </div>

                        <div className="pt-4 flex items-center justify-between">
                          <button 
                            type="submit" 
                            disabled={updateProfileMutation.isPending}
                            className="px-8 py-3 bg-gray-900 hover:bg-black text-white font-black rounded-xl shadow-md transition-all disabled:opacity-50"
                          >
                            {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </div>

                      <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-gray-900">Danger Zone</h4>
                          <p className="text-sm font-semibold text-gray-500 mt-1">Permanently delete your StoreVille account.</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setShowDeleteConfirm(true)}
                          className="px-6 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-bold rounded-xl transition-colors flex items-center gap-2"
                        >
                          <Trash2 size={16} /> Delete Account
                        </button>
                      </div>
                    </form>
                  )}
                </motion.div>
              )}

            </div>
          </div>
        </motion.div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </main>
  )
}

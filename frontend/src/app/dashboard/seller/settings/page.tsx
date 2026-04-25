'use client'

import React, { useState, useEffect } from 'react'
import { Loader2, Save, User, MapPin, CreditCard, Star, ChevronRight, Store, ChefHat, Package, CheckCircle2 } from 'lucide-react'
import { api } from '@/lib/api'
import { motion } from 'framer-motion'
import { authClient } from '@/lib/auth-client'

export default function StoreSettingsPage() {
  const { data: session } = authClient.useSession()
  const user = session?.user

  const [store, setStore] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [activeTab, setActiveTab] = useState<'account' | 'location' | 'financials' | 'subscription'>('account')

  const [formData, setFormData] = useState({
    // Account
    legal_name: '',
    tax_id: '',
    contact_phone: '',
    // Location
    address_line1: '',
    address_line2: '',
    city: 'Addis Ababa',
    postal_code: '',
    // Financials
    bank_name: '',
    account_number: '',
    account_holder_name: '',
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/stores/manage/')
        const stores = Array.isArray(res.data) ? res.data : res.data.results || []
        
        if (stores.length > 0) {
          const s = stores[0]
          setStore(s)
          
          // Populate existing data
          setFormData({
            legal_name: s.legal_name || '',
            tax_id: s.tax_id || '',
            contact_phone: s.contact_phone || '',
            address_line1: s.address_line1 || '',
            address_line2: s.address_line2 || '',
            city: s.city || 'Addis Ababa',
            postal_code: s.postal_code || '',
            bank_name: s.bank_name || '',
            account_number: s.account_number || '',
            account_holder_name: s.account_holder_name || '',
          })
        }
      } catch (err) { 
        console.error(err) 
      } finally { 
        setIsFetching(false) 
      }
    }
    fetchDashboardData()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!store?.id) return
    setIsLoading(true)
    
    try {
      await api.patch(`/stores/manage/${store.id}/`, formData)
      alert("Settings Updated successfully!")
    } catch (err) { 
      alert("Error saving your settings.") 
    } finally { 
      setIsLoading(false) 
    }
  }

  if (isFetching) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-gray-900" size={40} /></div>
  
  const isFood = store?.store_type === 'FOOD'

  return (
    <main className="p-4 md:p-8 max-w-[1600px] mx-auto h-full flex flex-col gap-8 pb-32 relative z-10">
      
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="flex flex-col md:flex-row justify-between items-start md:items-end bg-white/70 backdrop-blur-2xl p-8 lg:p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900">Settings</h1>
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm ${isFood ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
              {isFood ? <ChefHat size={14}/> : <Package size={14}/>}
              {store?.store_type}
            </span>
          </div>
          <p className="text-gray-600 font-semibold text-lg ml-1">Manage your business profile.</p>
        </div>
        
        <div className="mt-6 md:mt-0">
          <button onClick={handleSave} disabled={isLoading} className="bg-black text-white px-8 py-3.5 rounded-full font-black tracking-widest text-xs uppercase hover:bg-gray-900 hover:-translate-y-0.5 flex items-center gap-2 shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)] transition-all disabled:opacity-70 disabled:hover:translate-y-0">
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
          </button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }} className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col md:flex-row flex-1 p-2">
        {/* TABS */}
        <div className="w-full md:w-64 bg-white/40 border-r border-gray-100 p-6 flex flex-col gap-3 rounded-l-[2rem]">
          <button onClick={() => setActiveTab('account')} className={`flex items-center gap-3 w-full p-4 rounded-2xl font-black tracking-wide transition-all text-sm group ${activeTab === 'account' ? 'bg-white shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-gray-100 text-gray-900' : 'text-gray-500 hover:bg-white/50 hover:text-gray-900'}`}>
             <User size={20} className={activeTab === 'account' ? '' : 'group-hover:scale-110 transition-transform'} /> Account Info
          </button>
          <button onClick={() => setActiveTab('location')} className={`flex items-center gap-3 w-full p-4 rounded-2xl font-black tracking-wide transition-all text-sm group ${activeTab === 'location' ? 'bg-white shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-gray-100 text-gray-900' : 'text-gray-500 hover:bg-white/50 hover:text-gray-900'}`}>
             <MapPin size={20} className={activeTab === 'location' ? '' : 'group-hover:scale-110 transition-transform'} /> Store Location
          </button>
          <button onClick={() => setActiveTab('financials')} className={`flex items-center gap-3 w-full p-4 rounded-2xl font-black tracking-wide transition-all text-sm group ${activeTab === 'financials' ? 'bg-white shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-gray-100 text-gray-900' : 'text-gray-500 hover:bg-white/50 hover:text-gray-900'}`}>
             <CreditCard size={20} className={activeTab === 'financials' ? '' : 'group-hover:scale-110 transition-transform'} /> Financials
          </button>
          <button onClick={() => setActiveTab('subscription')} className={`flex items-center gap-3 w-full p-4 rounded-2xl font-black tracking-wide transition-all text-sm group ${activeTab === 'subscription' ? 'bg-white shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-gray-100 text-gray-900' : 'text-gray-500 hover:bg-white/50 hover:text-gray-900'}`}>
             <Star size={20} className={activeTab === 'subscription' ? '' : 'group-hover:scale-110 transition-transform'} /> Subscription
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto max-w-4xl">
          {activeTab === 'account' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="duration-300 space-y-8">
              <div>
                <h2 className="text-xl font-black mb-1 flex items-center gap-2"><User size={20} className="text-gray-400" /> Account Information</h2>
                <p className="text-sm text-gray-500 font-medium mb-8">Your legal business details necessary for verification.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Owner Email</label>
                <div className="w-full bg-gray-100 border border-gray-200 rounded-2xl py-4 px-5 font-bold text-sm text-gray-500 cursor-not-allowed">
                  {user?.email || 'N/A'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Legal Business Name</label>
                <input type="text" value={formData.legal_name} onChange={(e) => setFormData({...formData, legal_name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-5 outline-none font-bold text-gray-900 focus:border-black focus:ring-1 focus:ring-black transition-all" placeholder="e.g. Acme Corporation Pvt. Ltd." />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Tax ID / TIN</label>
                  <input type="text" value={formData.tax_id} onChange={(e) => setFormData({...formData, tax_id: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-5 outline-none font-medium text-gray-900 focus:border-black focus:ring-1 focus:ring-black transition-all" placeholder="000-000-000" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Business Phone</label>
                  <input type="text" value={formData.contact_phone} onChange={(e) => setFormData({...formData, contact_phone: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-5 outline-none font-medium text-gray-900 focus:border-black focus:ring-1 focus:ring-black transition-all" placeholder="+251..." />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'location' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="duration-300 space-y-8">
              <div>
                <h2 className="text-xl font-black mb-1 flex items-center gap-2"><MapPin size={20} className="text-gray-400" /> Store Location</h2>
                <p className="text-sm text-gray-500 font-medium mb-8">Where your products are shipped from or picked up.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Address Line 1</label>
                <input type="text" value={formData.address_line1} onChange={(e) => setFormData({...formData, address_line1: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-5 outline-none font-medium text-gray-900 focus:border-black focus:ring-1 focus:ring-black transition-all" placeholder="Street name, building" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Address Line 2 (Optional)</label>
                <input type="text" value={formData.address_line2} onChange={(e) => setFormData({...formData, address_line2: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-5 outline-none font-medium text-gray-900 focus:border-black focus:ring-1 focus:ring-black transition-all" placeholder="Suite, floor, etc." />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">City</label>
                  <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-5 outline-none font-bold text-gray-900 focus:border-black focus:ring-1 focus:ring-black transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Postal Code</label>
                  <input type="text" value={formData.postal_code} onChange={(e) => setFormData({...formData, postal_code: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-5 outline-none font-medium text-gray-900 focus:border-black focus:ring-1 focus:ring-black transition-all" placeholder="1000" />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'financials' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="duration-300 space-y-8">
              <div>
                <h2 className="text-xl font-black mb-1 flex items-center gap-2"><CreditCard size={20} className="text-gray-400" /> Financials</h2>
                <p className="text-sm text-gray-500 font-medium mb-8">Where we send your payouts safely and securely.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Bank Name</label>
                <input type="text" value={formData.bank_name} onChange={(e) => setFormData({...formData, bank_name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-5 outline-none font-bold text-gray-900 focus:border-black focus:ring-1 focus:ring-black transition-all" placeholder="e.g. Commercial Bank of Ethiopia" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Account Number</label>
                <input type="text" value={formData.account_number} onChange={(e) => setFormData({...formData, account_number: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-5 outline-none font-black tracking-widest text-gray-900 focus:border-black focus:ring-1 focus:ring-black transition-all" placeholder="1000..." />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Account Holder Name</label>
                <input type="text" value={formData.account_holder_name} onChange={(e) => setFormData({...formData, account_holder_name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-5 outline-none font-bold text-gray-900 focus:border-black focus:ring-1 focus:ring-black transition-all" placeholder="Must match bank records" />
              </div>
            </motion.div>
          )}

          {activeTab === 'subscription' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="duration-300 space-y-8">
              <div>
                <h2 className="text-xl font-black mb-1 flex items-center gap-2"><Star size={20} className="text-gray-400" /> Subscription Plan</h2>
                <p className="text-sm text-gray-500 font-medium mb-8">Your current active plan on StoreVille.</p>
              </div>

              <div className="p-8 rounded-[2rem] border-2 border-gray-900 bg-gray-50 relative overflow-hidden">
                {store?.subscription_plan === 'PRO' && <div className="absolute top-0 right-0 w-32 h-32 bg-gray-900 text-white rounded-bl-full flex items-center justify-center translate-x-8 -translate-y-8"><Store size={32} className="opacity-20 mt-4 mr-4" /></div>}
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-gray-900 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full">Active Plan</span>
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-2">{store?.subscription_plan || 'BASIC'} STORE</h3>
                  <p className="text-sm font-semibold text-gray-600 mb-6">Enjoy premium storefront capabilities.</p>
                  
                  <div className="inline-flex flex-col sm:flex-row gap-4">
                    <button className="bg-white border border-gray-200 px-6 py-3 rounded-full font-bold text-sm text-gray-900 hover:bg-gray-50 transition-colors shadow-sm">Manage Billing</button>
                    <button className="bg-gray-900 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-black transition-colors shadow-md flex items-center gap-2 justify-center"><Star size={16}/> Upgrade Plan</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </main>
  )
}

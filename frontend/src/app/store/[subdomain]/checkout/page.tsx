'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Loader2, ArrowLeft, CheckCircle, ShieldCheck, MapPin, CreditCard, ChevronRight } from 'lucide-react'

export default function CheckoutPage({ params }: { params: { subdomain: string } }) {
  const router = useRouter()
  const [store, setStore] = useState<any>(null)
  const [cartItems, setCartItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const [formData, setFormData] = useState({
    customer_name: '',
    contact_phone: '',
    delivery_address: '',
    delivery_method: '',
    payment_method: 'COD'
  })

  useEffect(() => {
    // Read cart and store data
    const fetchStore = async () => {
      try {
        const storeRes = await api.get(`/stores/discovery/${params.subdomain}/`)
        setStore(storeRes.data)
        setFormData(prev => ({ ...prev, delivery_method: storeRes.data.store_type === 'FOOD' ? 'ASAP_DELIVERY' : 'STANDARD_DELIVERY' }))
        
        const savedCart = localStorage.getItem(`cart_${params.subdomain}`)
        if (savedCart) setCartItems(JSON.parse(savedCart))
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    // Ensure user has auth token before allowing checkout
    const token = localStorage.getItem('access_token') || localStorage.getItem('token')
    if (!token) {
      router.push(`/store/${params.subdomain}`) // Kick them back if they bypassed the Auth Modal
    } else {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchStore()
    }
  }, [params.subdomain, router])

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cartItems.length === 0) return alert("Your cart is empty!")

    setIsSubmitting(true)
    try {
      const payload = {
        store_id: store.id,
        ...formData,
        items: cartItems.map(item => ({ product_id: item.id, name: item.name, price: item.price, quantity: item.quantity }))
      }
      
      await api.post('/orders/checkout/', payload)
      
      // Clear cart from local storage and state
      localStorage.removeItem(`cart_${params.subdomain}`)
      setCartItems([])
      setIsSuccess(true)

    } catch (error: any) {
      console.error(error)
      alert("Failed to place order. The backend might still be restarting.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-gray-400" size={50} /></div>
  if (!store) return <div className="min-h-screen flex items-center justify-center"><h1 className="text-3xl font-light opacity-50">Store Unavailable</h1></div>

  const cartTotal = cartItems.reduce((acc, curr) => acc + (parseFloat(curr.price) * curr.quantity), 0).toFixed(2)

  const isFood = store.store_type === 'FOOD'
  const deliveryOptions = isFood 
    ? [{ id: 'ASAP_DELIVERY', label: 'ASAP GPS Delivery' }, { id: 'PICKUP_FOOD', label: 'Pick Up In-Store' }]
    : [{ id: 'STANDARD_DELIVERY', label: 'Standard Local Delivery' }, { id: 'EXPRESS_COURIER', label: 'Express Courier' }, { id: 'STORE_PICKUP_RETAIL', label: 'Store Pickup' }]

  if (isSuccess) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center animate-in fade-in duration-700">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-2xl" style={{ backgroundColor: store.primary_color, color: '#fff' }}>
          <CheckCircle size={50} />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-gray-900">Order Confirmed!</h1>
        <p className="text-lg text-gray-500 font-medium max-w-md mb-10">We have securely sent your order to <strong>{store.name}</strong>. They will contact you shortly regarding fulfillment.</p>
        <button onClick={() => router.push(`/store/${params.subdomain}`)} className="px-8 py-4 rounded-xl font-black tracking-widest uppercase text-white shadow-xl hover:scale-105 transition-all" style={{ backgroundColor: store.primary_color }}>
          Back to Store
        </button>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-black selection:text-white pb-32">
      {/* MINIMAL HEADER */}
      <header className="bg-white border-b border-gray-200 py-6 px-4 md:px-12 flex items-center justify-between sticky top-0 z-50">
        <button onClick={() => router.push(`/store/${params.subdomain}`)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors">
          <ArrowLeft size={18} /> Back to store
        </button>
        <div className="flex items-center gap-2 text-gray-400 font-bold text-sm tracking-widest uppercase">
          <ShieldCheck size={18} /> Secure Checkout
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto mt-8 md:mt-16 px-4 md:px-8 flex flex-col lg:flex-row gap-12 items-start">
        
        {/* LEFT COLUMN: CHECKOUT FORM */}
        <section className="flex-1 w-full bg-white p-6 md:p-12 rounded-[2rem] shadow-sm border border-gray-100">
          <h2 className="text-3xl font-black tracking-tight mb-8">Shipping & Payment</h2>
          
          <form onSubmit={handleCheckoutSubmit} className="space-y-8">
            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b pb-2 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold tracking-widest uppercase text-gray-500 mb-2">Full Name</label>
                  <input required type="text" value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none font-bold focus:border-black focus:ring-1 focus:ring-black transition-all" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold tracking-widest uppercase text-gray-500 mb-2">Phone Number</label>
                  <input required type="tel" value={formData.contact_phone} onChange={e => setFormData({...formData, contact_phone: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none font-bold focus:border-black focus:ring-1 focus:ring-black transition-all" placeholder="+251..." />
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="space-y-4 pt-6">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b pb-2 mb-4">Delivery Method</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {deliveryOptions.map(opt => (
                  <div key={opt.id} onClick={() => setFormData({...formData, delivery_method: opt.id})} className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${formData.delivery_method === opt.id ? 'border-black bg-gray-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.delivery_method === opt.id ? 'border-black' : 'border-gray-300'}`}>
                      {formData.delivery_method === opt.id && <div className="w-2.5 h-2.5 bg-black rounded-full"></div>}
                    </div>
                    <span className="font-bold text-sm">{opt.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <label className="block text-[11px] font-bold tracking-widest uppercase text-gray-500 mb-2">Delivery Address / GPS Note</label>
                <textarea required value={formData.delivery_address} onChange={e => setFormData({...formData, delivery_address: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none font-medium text-sm focus:border-black focus:ring-1 focus:ring-black transition-all min-h-[100px]" placeholder="Specific directions..." />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-4 pt-6">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b pb-2 mb-4">Payment Selection</h3>
              <div className="grid grid-cols-2 gap-3">
                {['COD', 'TELEBIRR'].map(method => (
                  <div key={method} onClick={() => setFormData({...formData, payment_method: method})} className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-center gap-2 ${formData.payment_method === method ? 'border-black bg-gray-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                    {method === 'COD' ? <MapPin size={18}/> : <CreditCard size={18}/>}
                    <span className="font-black text-sm">{method === 'COD' ? 'Cash on Delivery' : 'Telebirr'}</span>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={isSubmitting || cartItems.length === 0} className="w-full mt-8 py-5 rounded-xl text-sm font-black tracking-widest uppercase shadow-xl hover:scale-[1.02] transition-transform flex justify-center items-center gap-2 disabled:opacity-50 disabled:hover:scale-100" style={{ backgroundColor: store.primary_color, color: '#fff' }}>
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : `Confirm & Pay Br ${cartTotal}`}
            </button>
          </form>
        </section>

        {/* RIGHT COLUMN: ORDER SUMMARY */}
        <aside className="w-full lg:w-[400px] shrink-0 sticky top-32">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <h3 className="text-xl font-black tracking-tight mb-6 flex items-center justify-between">
              Order Summary <span className="text-sm bg-gray-100 text-gray-500 px-3 py-1 rounded-full">{cartItems.reduce((a, c) => a + c.quantity, 0)} Items</span>
            </h3>
            
            <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2 mb-6">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-center">
                  <div className="w-16 h-20 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                    {item.image && <img src={item.image} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                  </div>
                  <div className="font-black text-gray-900 text-sm">Br {item.price}</div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-6 space-y-3">
              <div className="flex justify-between text-sm font-bold text-gray-500">
                <span>Subtotal</span>
                <span>Br {cartTotal}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-500">
                <span>Delivery</span>
                <span className="text-green-600">Calculated later</span>
              </div>
              <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-100">
                <span className="text-lg font-black text-gray-900">Total</span>
                <span className="text-2xl font-black text-gray-900" style={{ color: store.primary_color }}>Br {cartTotal}</span>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </main>
  )
}
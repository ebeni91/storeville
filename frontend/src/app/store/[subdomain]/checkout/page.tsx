'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Loader2, MapPin, CreditCard, ArrowRight, CheckCircle, Clock, FileText, ChevronLeft, ShoppingBag } from 'lucide-react'

export default function CheckoutPage({ params }: { params: { subdomain: string } }) {
  const router = useRouter()
  
  // Core States
  const [store, setStore] = useState<any>(null)
  const [cartItems, setCartItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)

  // Form States
  const [address, setAddress] = useState('')
  const [instructions, setInstructions] = useState('') // For Food
  const [isAsap, setIsAsap] = useState(true) // For Food

  useEffect(() => {
    const fetchCheckoutData = async () => {
      try {
        // 1. Verify User is Authenticated
        const token = localStorage.getItem('access_token') || localStorage.getItem('token')
        if (!token) {
          router.push(`/store/${params.subdomain}`)
          return
        }
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`

        // 2. Fetch Store Profile
        const storeRes = await api.get(`/stores/discovery/by_slug/?slug=${params.subdomain}`)
        const storeData = storeRes.data
        setStore(storeData)

        // 3. Load the correct cart based on architecture
        const cartKey = storeData.store_type === 'FOOD' ? `cart_food_${storeData.id}` : `cart_retail_${storeData.id}`
        const savedCart = localStorage.getItem(cartKey)
        
        if (savedCart) {
          setCartItems(JSON.parse(savedCart))
        } else {
          setCartItems([])
        }
      } catch (err) {
        console.error("Checkout Initialization Error", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCheckoutData()
  }, [params.subdomain, router])

  const subtotal = cartItems.reduce((acc, curr) => acc + (parseFloat(curr.price) * curr.quantity), 0)
  const deliveryFee = store?.store_type === 'FOOD' ? 50.00 : 150.00 // Example dynamic fees
  const total = subtotal + deliveryFee

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (store.store_type === 'FOOD') {
        // 🍔 SUBMIT TO FOOD ENGINE
        const payload = {
          store: store.id,
          delivery_address: address,
          delivery_instructions: instructions,
          is_asap: isAsap,
          items: cartItems.map(item => ({
            menu_item_id: item.id,
            quantity: item.quantity,
            special_requests: item.special_requests || ''
          }))
        }
        await api.post('/orders/food/', payload)
        localStorage.removeItem(`cart_food_${store.id}`)
        
      } else {
        // 🛍️ SUBMIT TO RETAIL ENGINE
        const payload = {
          store: store.id,
          shipping_address: address,
          items: cartItems.map(item => ({
            product_id: item.id,
            quantity: item.quantity
          }))
        }
        await api.post('/orders/retail/', payload)
        localStorage.removeItem(`cart_retail_${store.id}`)
      }

      setOrderComplete(true)
    } catch (err: any) {
      console.error("Order submission failed:", err.response?.data || err.message)
      alert("Failed to place order. Please check your details and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-indigo-600" size={50} /></div>
  }

  if (cartItems.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <ShoppingBag size={64} className="text-gray-300 mb-6" />
        <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-2">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-8 font-medium">Add some items before proceeding to checkout.</p>
        <button onClick={() => router.push(`/store/${params.subdomain}`)} className="px-8 py-4 bg-gray-900 text-white rounded-full font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform">
          Return to Store
        </button>
      </div>
    )
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center" style={{ backgroundColor: store.background_color, color: store.secondary_color }}>
        <div className="bg-white/10 backdrop-blur-xl p-10 rounded-[3rem] border shadow-2xl max-w-lg w-full" style={{ borderColor: `rgba(${store.secondary_color}, 0.1)` }}>
          <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle size={48} />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Order Confirmed!</h1>
          <p className="opacity-70 font-medium mb-8">
            {store.store_type === 'FOOD' 
              ? "The kitchen has received your order and is preparing it now." 
              : "Your order has been placed and is being processed for shipping."}
          </p>
          <button onClick={() => router.push(`/store/${params.subdomain}`)} className="w-full py-4 rounded-xl font-black tracking-widest uppercase shadow-xl hover:opacity-90 transition-opacity" style={{ backgroundColor: store.primary_color, color: '#fff' }}>
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen pb-24 font-sans" style={{ backgroundColor: store.background_color || '#fafafa', color: store.secondary_color || '#111827' }}>
      
      {/* HEADER */}
      <div className="sticky top-0 z-50 backdrop-blur-xl border-b px-4 py-4" style={{ borderColor: `rgba(0,0,0,0.05)`, backgroundColor: `rgba(255,255,255,0.8)` }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={() => router.push(`/store/${params.subdomain}`)} className="flex items-center gap-2 font-bold text-sm hover:opacity-70 transition-opacity text-gray-900">
            <ChevronLeft size={18} /> Back to Store
          </button>
          <h1 className="text-xl font-black tracking-tighter text-gray-900">Secure Checkout</h1>
          <div className="w-20"></div> {/* Spacer for center alignment */}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8 flex flex-col md:flex-row gap-8">
        
        {/* LEFT COLUMN: FORM */}
        <div className="flex-1 space-y-8">
          
          <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-6">
            
            {/* Delivery/Shipping Address Block */}
            <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border shadow-sm" style={{ borderColor: `rgba(0,0,0,0.05)` }}>
              <h2 className="text-xl font-black tracking-tight mb-6 flex items-center gap-2 text-gray-900">
                <MapPin size={20} className="text-indigo-500" />
                {store.store_type === 'FOOD' ? 'Delivery Location' : 'Shipping Address'}
              </h2>
              
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase opacity-60 mb-2 text-gray-700">Full Address</label>
                <textarea 
                  required 
                  value={address} 
                  onChange={e => setAddress(e.target.value)} 
                  className="w-full bg-white border border-gray-200 rounded-xl p-4 outline-none font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none min-h-[100px] text-gray-900" 
                  placeholder={store.store_type === 'FOOD' ? "e.g., Bole Atlas, near Jupiter Hotel, House #123" : "e.g., 123 Main St, Apt 4B, Addis Ababa"} 
                />
              </div>

              {/* FOOD SPECIFIC FIELDS */}
              {store.store_type === 'FOOD' && (
                <div className="mt-6 space-y-6 pt-6 border-t border-gray-100">
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase opacity-60 mb-2 text-gray-700 flex items-center gap-1.5">
                      <FileText size={14} /> Driver Instructions (Optional)
                    </label>
                    <input 
                      type="text" 
                      value={instructions} 
                      onChange={e => setInstructions(e.target.value)} 
                      className="w-full bg-white border border-gray-200 rounded-xl p-4 outline-none font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-900" 
                      placeholder="e.g., Leave at the front door, ring doorbell." 
                    />
                  </div>
                  
                  <div className="flex items-center gap-4 bg-orange-50/50 p-4 rounded-xl border border-orange-100/50">
                    <Clock size={20} className="text-orange-500 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">Delivery Time</p>
                      <p className="text-xs text-gray-500 font-medium">Kitchen needs ~20 mins to prepare.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200">
                      <button type="button" onClick={() => setIsAsap(true)} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${isAsap ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>ASAP</button>
                      <button type="button" onClick={() => setIsAsap(false)} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${!isAsap ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>Schedule</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Block (Placeholder for Chapa) */}
            <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border shadow-sm" style={{ borderColor: `rgba(0,0,0,0.05)` }}>
              <h2 className="text-xl font-black tracking-tight mb-6 flex items-center gap-2 text-gray-900">
                <CreditCard size={20} className="text-green-500" />
                Payment Method
              </h2>
              <div className="border-2 border-green-500 bg-green-50/50 rounded-xl p-4 flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-green-600 font-black text-xs">C</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Pay with Chapa</p>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-green-600">Telebirr, CBE Birr, Cards</p>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full border-4 border-green-500 bg-white"></div>
              </div>
            </div>

          </form>
        </div>

        {/* RIGHT COLUMN: ORDER SUMMARY */}
        <div className="w-full md:w-[380px] shrink-0">
          <div className="sticky top-24 bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border shadow-xl" style={{ borderColor: `rgba(0,0,0,0.05)` }}>
            <h2 className="text-xl font-black tracking-tight mb-6 text-gray-900">Order Summary</h2>
            
            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 mb-6">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-center">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                    {item.image && <img src={item.image} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate">{item.name}</h4>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-black text-gray-900 shrink-0">Br {parseFloat(item.price) * item.quantity}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-6 border-t border-gray-100 text-sm font-medium text-gray-600">
              <div className="flex justify-between"><span>Subtotal</span><span>Br {subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>{store.store_type === 'FOOD' ? 'Delivery Fee' : 'Shipping Fee'}</span><span>Br {deliveryFee.toFixed(2)}</span></div>
              <div className="flex justify-between pt-4 border-t border-gray-100 text-xl font-black text-gray-900 mt-2">
                <span>Total</span>
                <span style={{ color: store.primary_color }}>Br {total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              form="checkout-form"
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-4 mt-8 rounded-xl text-sm font-black tracking-widest uppercase shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100" 
              style={{ backgroundColor: store.primary_color, color: '#fff' }}
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : `Pay Br ${total.toFixed(2)}`}
            </button>
            <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4">
              Securely processed by Chapa
            </p>
          </div>
        </div>

      </div>
    </main>
  )
}
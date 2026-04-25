'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '@/lib/api'
import { Search, MapPin, Package, Clock, CheckCircle2, ChevronLeft, Loader2, Info, ShoppingBag } from 'lucide-react'

export default function TrackOrderTab({ variants }: { variants?: any }) {
  const [orderId, setOrderId] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderId.trim()) return

    setIsSearching(true)
    setError('')
    setOrder(null)

    try {
      // Clean up the UUID in case they pasted spaces
      const cleanedId = orderId.trim()
      
      let fetchedOrder = null
      let storeType = 'RETAIL'

      // Strategy: Try Retail first. If 404, try Food.
      try {
        const retailRes = await api.get(`/orders/retail/track/?id=${cleanedId}`)
        fetchedOrder = retailRes.data
        storeType = 'RETAIL'
      } catch (err: any) {
        if (err.response?.status === 404) {
          const foodRes = await api.get(`/orders/food/track/?id=${cleanedId}`)
          fetchedOrder = foodRes.data
          storeType = 'FOOD'
        } else {
          throw err
        }
      }

      setOrder({ ...fetchedOrder, storeType })
    } catch (err: any) {
      console.error(err)
      setError('Order not found. Please verify the ID and try again.')
    } finally {
      setIsSearching(false)
    }
  }

  // Define progress constants
  const statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED']
  // Food uses different sometimes? Status from backend: PENDING, PROCESSING, READY, DELIVERED, CANCELLED
  // Let's make it robust based on the text.
  
  const getProgressTracker = (status: string, storeType: string) => {
    const isFood = storeType === 'FOOD'
    const defaultSteps = [
      { id: 'PENDING', label: 'Order Placed', icon: Clock },
      { id: 'PROCESSING', label: isFood ? 'Preparing' : 'Processing', icon: Package },
      { id: 'SHIPPED', label: isFood ? 'On the Way' : 'Shipped', icon: MapPin },
      { id: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 }
    ]
    
    // Map backend statuses to these four steps
    let currentStepIdx = 0
    if (status === 'PROCESSING') currentStepIdx = 1
    if (status === 'READY' || status === 'SHIPPED') currentStepIdx = 2
    if (status === 'DELIVERED') currentStepIdx = 3
    if (status === 'CANCELLED') currentStepIdx = -1

    return { steps: defaultSteps, currentStepIdx }
  }

  return (
    <motion.div variants={variants} className="bg-white/70 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-8">
      <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-900 mb-8"><Search size={26} className="text-blue-600" /> Track Order</h2>
      
      <div className="max-w-2xl mx-auto">
        {/* SEARCH BOX */}
        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 mb-8 max-w-2xl mx-auto relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={28} />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-gray-900 mb-2">Find Your Order</h2>
            <p className="text-gray-500 font-medium text-sm">Enter the tracking ID from your confirmation email.</p>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div className="relative">
              <input 
                type="text" 
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl py-4 px-6 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-mono text-sm"
                required
              />
            </div>
            <button 
              type="submit"
              disabled={isSearching || !orderId.trim()}
              className="w-full bg-gray-900 text-white rounded-2xl py-4 font-black tracking-widest uppercase text-xs shadow-lg hover:bg-black hover:-translate-y-0.5 transition-all disabled:opacity-50 flex justify-center"
            >
              {isSearching ? <Loader2 size={16} className="animate-spin" /> : 'Track Package'}
            </button>
            {error && <p className="text-red-500 text-xs font-bold text-center mt-2 flex justify-center items-center gap-1"><Info size={14}/> {error}</p>}
          </form>
        </div>

        {/* RESULTS */}
        <AnimatePresence mode="wait">
          {order && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-2xl shadow-gray-200/40 border border-gray-100"
            >
              {/* Order Meta */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-8 border-b border-gray-100">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Order Details</p>
                  <h3 className="text-lg md:text-xl font-black text-gray-900 tracking-tight font-mono">{order.id.split('-')[0].toUpperCase()}</h3>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total</p>
                  <p className="text-xl md:text-2xl font-black text-gray-900 tracking-tighter">Br {order.total_amount}</p>
                </div>
              </div>

              {/* Progress Tracker */}
              {order.status === 'CANCELLED' ? (
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 flex items-center gap-4 mb-10">
                  <Info size={24} />
                  <div>
                    <h4 className="font-black">Order Cancelled</h4>
                    <p className="text-sm font-medium opacity-80">This order has been cancelled and will not be delivered.</p>
                  </div>
                </div>
              ) : (
                <div className="mb-12 relative">
                  {/* Progress Line */}
                  <div className="absolute top-5 inset-x-[10%] md:inset-x-12 h-1 bg-gray-100 rounded-full" />
                  <div 
                    className="absolute top-5 left-[10%] md:left-12 h-1 bg-blue-500 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${(getProgressTracker(order.status, order.storeType).currentStepIdx / 3) * 80}%` }} 
                  />

                  <div className="flex justify-between relative z-10">
                    {getProgressTracker(order.status, order.storeType).steps.map((step, idx) => {
                      const isActive = idx <= getProgressTracker(order.status, order.storeType).currentStepIdx
                      const isCurrent = idx === getProgressTracker(order.status, order.storeType).currentStepIdx
                      return (
                        <div key={step.id} className="flex flex-col items-center gap-3">
                          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-100 text-gray-400 border-2 border-white'}`}>
                            <step.icon size={isCurrent ? 20 : 16} strokeWidth={isActive ? 3 : 2} />
                          </div>
                          <span className={`text-[10px] md:text-xs font-bold tracking-widest uppercase text-center ${isActive ? 'text-blue-900' : 'text-gray-400'}`}>
                            {step.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Items List */}
              <div>
                <h4 className="text-sm font-black tracking-widest uppercase text-gray-900 mb-6 flex items-center gap-2">
                  <Package size={16} /> Included Items
                </h4>
                <div className="space-y-4">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                          <ShoppingBag size={20} className="text-gray-400" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{item.quantity}x Item from order</p>
                          <p className="text-xs font-medium text-gray-500">Price at time: Br {item.price_at_time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

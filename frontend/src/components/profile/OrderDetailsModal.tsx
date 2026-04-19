'use client'
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Package, Truck, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export default function OrderDetailsModal({ isOpen, onClose, order }: any) {
  const queryClient = useQueryClient()
  
  const cancelMutation = useMutation({
    mutationFn: async () => {
      const endpoint = order.type === 'retail' ? `/orders/retail/${order.rawId}/` : `/orders/food/${order.rawId}/`
      // Assuming a PATCH to change status to 'cancelled'
      return api.patch(endpoint, { status: 'cancelled' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retailOrders'] })
      queryClient.invalidateQueries({ queryKey: ['foodOrders'] })
      onClose()
    }
  })

  if (!isOpen || !order) return null

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.95, y: 20 }} 
          animate={{ scale: 1, y: 0 }} 
          exit={{ scale: 0.95, y: 20 }}
          className="bg-white/90 backdrop-blur-xl w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden border border-white"
        >
          <div className="p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                <Package className="text-gray-900" /> 
                Order ORD-{order.id}
              </h2>
              <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <div>
                  <p className="text-sm font-bold text-gray-500">Total Price</p>
                  <p className="text-2xl font-black text-gray-900">{order.total}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-500">Current Status</p>
                  <span className={`inline-flex items-center justify-end gap-1.5 mt-1 text-sm font-black uppercase tracking-widest ${
                    order.status === 'delivered' ? 'text-emerald-600' : 
                    order.status === 'shipped' || order.status === 'dispatched' ? 'text-blue-600' : 
                    order.status === 'cancelled' ? 'text-red-600' :
                    'text-orange-600'
                  }`}>
                    {order.status === 'delivered' ? <CheckCircle size={16} /> : 
                     order.status === 'cancelled' ? <AlertCircle size={16} /> :
                     order.status === 'shipped' || order.status === 'dispatched' ? <Truck size={16} /> :
                     <Clock size={16} />}
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Progress Tracker (simplified) */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                <h3 className="font-bold text-gray-900 mb-4">Tracking Progress</h3>
                <div className="relative pt-2 pb-4">
                  <div className="absolute left-4 top-2 bottom-4 w-1 bg-gray-200 rounded-full"></div>
                  <div className={`absolute left-4 top-2 w-1 bg-gray-900 rounded-full transition-all duration-1000 ${
                    order.status === 'delivered' ? 'bottom-4' : 
                    order.status === 'shipped' || order.status === 'dispatched' ? 'h-2/3' : 
                   'h-1/3'
                  }`}></div>
                  
                  <div className="space-y-6 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center shadow-md border-4 border-white flex-shrink-0">
                        <CheckCircle size={14} className="text-white" />
                      </div>
                      <div><p className="font-bold text-gray-900 leading-tight">Order Placed</p><p className="text-xs font-semibold text-gray-500">{order.date}</p></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm border-4 border-white flex-shrink-0 transition-colors ${order.status !== 'pending' && order.status !== 'cancelled' ? 'bg-gray-900' : 'bg-gray-200'}`}>
                        <Truck size={14} className="text-white" />
                      </div>
                      <div><p className={`font-bold leading-tight ${order.status !== 'pending' && order.status !== 'cancelled' ? 'text-gray-900' : 'text-gray-400'}`}>On the way</p></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm border-4 border-white flex-shrink-0 transition-colors ${order.status === 'delivered' ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                        <CheckCircle size={14} className="text-white" />
                      </div>
                      <div><p className={`font-bold leading-tight ${order.status === 'delivered' ? 'text-gray-900' : 'text-gray-400'}`}>Delivered</p></div>
                    </div>
                  </div>
                </div>
              </div>

              {order.status === 'pending' && (
                <button 
                  onClick={() => cancelMutation.mutate()}
                  disabled={cancelMutation.isPending}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold py-4 rounded-xl transition-all disabled:opacity-50"
                >
                  {cancelMutation.isPending ? 'Canceling...' : 'Cancel Order'}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

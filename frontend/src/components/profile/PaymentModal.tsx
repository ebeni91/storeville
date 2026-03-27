'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CreditCard, Check } from 'lucide-react'
import { api } from '@/lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export default function PaymentModal({ isOpen, onClose, paymentToEdit }: any) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({ card_last4: '', brand: 'Visa', exp_month: 12, exp_year: 2028, is_default: false })
  
  useEffect(() => {
    if (paymentToEdit) setFormData(paymentToEdit)
    else setFormData({ card_last4: '', brand: 'Visa', exp_month: 12, exp_year: 2028, is_default: false })
  }, [paymentToEdit, isOpen])

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (paymentToEdit) return api.put(`/accounts/payment-methods/${paymentToEdit.id}/`, data)
      return api.post('/accounts/payment-methods/', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] })
      onClose()
    }
  })

  if (!isOpen) return null

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
          className="bg-white/90 backdrop-blur-xl w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden border border-white"
        >
          <div className="p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                <CreditCard className="text-indigo-600" /> 
                {paymentToEdit ? 'Edit Card' : 'Add New Card'}
              </h2>
              <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(formData) }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Card Brand</label>
                  <select value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-semibold">
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="Amex">Amex</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Last 4 Digits</label>
                  <input required maxLength={4} pattern="\d{4}" type="text" value={formData.card_last4} onChange={e => setFormData({...formData, card_last4: e.target.value.replace(/\D/g,'')})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-semibold tracking-widest text-center" placeholder="1234" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Exp. Month</label>
                  <input required min={1} max={12} type="number" value={formData.exp_month} onChange={e => setFormData({...formData, exp_month: parseInt(e.target.value)})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-semibold" placeholder="12" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Exp. Year</label>
                  <input required min={2024} type="number" value={formData.exp_year} onChange={e => setFormData({...formData, exp_year: parseInt(e.target.value)})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-semibold" placeholder="2028" />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer pt-2 group">
                <div className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${formData.is_default ? 'bg-indigo-500 border-indigo-500' : 'bg-gray-50 border-gray-300 group-hover:border-indigo-400'}`}>
                  {formData.is_default && <Check size={16} className="text-white" />}
                </div>
                <input type="checkbox" className="hidden" checked={formData.is_default} onChange={e => setFormData({...formData, is_default: e.target.checked})} />
                <span className="font-bold text-gray-700">Set as Default Payment</span>
              </label>

              <button 
                type="submit" 
                disabled={mutation.isPending}
                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg py-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                {mutation.isPending ? 'Saving...' : 'Save Payment'}
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

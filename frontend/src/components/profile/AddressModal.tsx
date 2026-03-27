'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Check } from 'lucide-react'
import { api } from '@/lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export default function AddressModal({ isOpen, onClose, addressToEdit }: any) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({ label: '', street_address: '', city_subcity: '', is_primary: false })
  
  useEffect(() => {
    if (addressToEdit) setFormData(addressToEdit)
    else setFormData({ label: '', street_address: '', city_subcity: '', is_primary: false })
  }, [addressToEdit, isOpen])

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (addressToEdit) return api.put(`/accounts/addresses/${addressToEdit.id}/`, data)
      return api.post('/accounts/addresses/', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
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
                <MapPin className="text-emerald-600" /> 
                {addressToEdit ? 'Edit Address' : 'New Address'}
              </h2>
              <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(formData) }} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Label (e.g., Home, Work)</label>
                <input required type="text" value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-semibold" placeholder="My Home" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Street Address</label>
                <input required type="text" value={formData.street_address} onChange={e => setFormData({...formData, street_address: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-semibold" placeholder="House No. 124, Bole Blvd" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">City / Subcity</label>
                <input required type="text" value={formData.city_subcity} onChange={e => setFormData({...formData, city_subcity: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-semibold" placeholder="Addis Ababa, Bole" />
              </div>

              <label className="flex items-center gap-3 cursor-pointer pt-2 group">
                <div className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${formData.is_primary ? 'bg-emerald-500 border-emerald-500' : 'bg-gray-50 border-gray-300 group-hover:border-emerald-400'}`}>
                  {formData.is_primary && <Check size={16} className="text-white" />}
                </div>
                <input type="checkbox" className="hidden" checked={formData.is_primary} onChange={e => setFormData({...formData, is_primary: e.target.checked})} />
                <span className="font-bold text-gray-700">Set as Primary Address</span>
              </label>

              <button 
                type="submit" 
                disabled={mutation.isPending}
                className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg py-4 rounded-xl shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
              >
                {mutation.isPending ? 'Saving...' : 'Save Address'}
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, AlertTriangle } from 'lucide-react'
import { api } from '@/lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

export default function ProfileModal({ isOpen, onClose }: any) {
  const { data: session } = authClient.useSession()
  const user = session?.user
  const router = useRouter()
  const [formData, setFormData] = useState({ name: '' })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  useEffect(() => {
    if (user) setFormData({ name: user.name || '' })
  }, [user, isOpen])

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      // First, update Django for consistency if needed, but better-auth is the source of truth
      await api.put(`/accounts/profile/`, { 
        first_name: data.name.split(' ')[0], 
        last_name: data.name.split(' ').slice(1).join(' ') 
      })
      
      // Update the main identity provider
      const { data: updatedUser, error } = await authClient.updateUser({
        name: data.name,
      })
      if (error) throw error
      return updatedUser
    },
    onSuccess: () => {
      onClose()
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      // Cleanup Django record
      await api.delete(`/accounts/profile/`) 
      // Delete from Better-Auth
      const { error } = await authClient.deleteUser()
      if (error) throw error
    },
    onSuccess: async () => {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push('/')
          }
        }
      })
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
                <User className="text-indigo-600" /> 
                Profile Info
              </h2>
              <button onClick={() => { setShowDeleteConfirm(false); onClose() }} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            {showDeleteConfirm ? (
              <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-center">
                <AlertTriangle className="mx-auto text-red-500 mb-3" size={32} />
                <h3 className="text-lg font-black text-red-700 mb-2">Delete Account?</h3>
                <p className="text-sm text-red-600 mb-6 font-semibold">This action is permanent and cannot be undone. All your orders, payments, and wishlists will be wiped.</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-white text-gray-700 font-bold py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">Cancel</button>
                  <button onClick={() => deleteMutation.mutate()} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-600/30 transition-colors disabled:opacity-50">Confirm</button>
                </div>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(formData) }} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-semibold" placeholder="John Doe" />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={mutation.isPending}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg py-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                  >
                    {mutation.isPending ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>

                <div className="pt-6 border-t border-gray-100 mt-6">
                  <button 
                    type="button" 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold py-3 rounded-xl transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

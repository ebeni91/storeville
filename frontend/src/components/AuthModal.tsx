'use client'

import React, { useState } from 'react'
import { Chrome, X, CheckCircle2, Loader2 } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { useRouter } from 'next/navigation'

export default function AuthModal({ store, bgRgb, textRgb, onMergeCart }: { store: any, bgRgb: string, textRgb: string, onMergeCart?: () => Promise<void> }) {
  const { isAuthModalOpen, closeAuthModal } = useAuthStore()
  const router = useRouter()

  const [authPhone, setAuthPhone] = useState('')
  const [authOtp, setAuthOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const handleGoogleAuth = async () => {
    setAuthLoading(true)
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: window.location.href,
      })
    } catch (err: any) {
      setAuthError(err.message || "Google sign-in failed.")
      setAuthLoading(false)
    }
  }

  const handleSendOtp = async () => {
    setAuthError('')
    setAuthLoading(true)
    try {
      const { error: err } = await (authClient as any).phoneNumber.sendOtp({
        phoneNumber: authPhone,
      })
      if (err) throw new Error(err.message)
      setOtpSent(true)
    } catch (err: any) {
      setAuthError(err.message || 'Could not send OTP.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)
    try {
      const { error: err } = await (authClient as any).phoneNumber.verify({
        phoneNumber: authPhone,
        code: authOtp,
      })
      if (err) throw new Error(err.message)
      
      if (onMergeCart) {
        await onMergeCart()
      }
      
      closeAuthModal()
      router.refresh()
    } catch (err: any) {
      setAuthError(err.message || 'Invalid OTP.')
    } finally {
      setAuthLoading(false)
    }
  }

  return (
    <div className={`fixed inset-0 z-[300] flex items-center justify-center transition-all duration-500 ${isAuthModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={closeAuthModal}></div>
      <div className="relative w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl border transition-transform duration-500 scale-100" style={{ backgroundColor: `rgba(${bgRgb}, 0.98)`, color: store.secondary_color, borderColor: `rgba(${textRgb}, 0.1)` }}>
        <button onClick={closeAuthModal} className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 transition-colors"><X size={20} /></button>
        
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-xl border" style={{ backgroundColor: store.primary_color, color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-3xl font-black tracking-tighter mb-2">Sign In</h2>
          <p className="text-sm opacity-60 font-medium">Verify your identity to place your order.</p>
        </div>

        <div className="space-y-6">
          <button 
            onClick={handleGoogleAuth}
            disabled={authLoading}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white border border-gray-200 shadow-sm font-bold text-gray-700 hover:bg-gray-50 transition-all font-sans"
          >
            <Chrome size={20} className="text-orange-500" />
            Continue with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em] opacity-40"><span className="bg-transparent px-4">OR USE PHONE</span></div>
          </div>

          {authError && <div className="text-xs font-bold text-red-500 text-center bg-red-50 p-3 rounded-xl border border-red-100">{authError}</div>}

          {!otpSent ? (
            <div className="flex flex-col gap-3">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[12px] font-black opacity-40">+251</div>
                <input 
                  type="tel" 
                  value={authPhone} 
                  onChange={e => setAuthPhone(e.target.value)}
                  placeholder="911 234 567"
                  className="w-full bg-black/5 border-none rounded-2xl py-4 pl-14 pr-4 outline-none font-bold text-base focus:ring-2 focus:ring-gray-900/20"
                  style={{ color: store.secondary_color }}
                />
              </div>
              <button 
                onClick={handleSendOtp}
                disabled={authLoading || authPhone.length < 9}
                className="w-full py-4 rounded-2xl font-black tracking-widest uppercase text-xs shadow-xl transition-all disabled:opacity-50"
                style={{ backgroundColor: store.primary_color, color: '#fff' }}
              >
                {authLoading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Send Verification Code'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <input 
                type="text" 
                maxLength={6}
                value={authOtp}
                onChange={e => setAuthOtp(e.target.value)}
                placeholder="······"
                className="w-full bg-black/5 border-none rounded-2xl py-5 text-center font-black text-3xl tracking-[1rem] outline-none focus:ring-2 focus:ring-gray-900/20"
                style={{ color: store.secondary_color }}
              />
              <button 
                type="submit"
                disabled={authLoading || authOtp.length < 6}
                className="w-full py-4 rounded-2xl font-black tracking-widest uppercase text-xs shadow-xl transition-all disabled:opacity-50"
                style={{ backgroundColor: store.primary_color, color: '#fff' }}
              >
                {authLoading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Verify & Continue'}
              </button>
              <button type="button" onClick={() => setOtpSent(false)} className="text-[10px] font-black tracking-widest uppercase opacity-40 hover:opacity-100 transition-opacity">Change phone number</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

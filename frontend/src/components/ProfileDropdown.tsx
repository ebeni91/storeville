'use client'

import React, { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { LogOut, ShoppingBag, Heart, MapPin, Settings, Headphones, User, Rocket } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

interface ProfileDropdownProps {
  isOpen: boolean
  onClose: () => void
  onSignOut: () => void
  userEmail?: string
  userName?: string
  // Store customizations
  bgRgb?: string
  textRgb?: string
}

export default function ProfileDropdown({ isOpen, onClose, onSignOut, userEmail, userName, bgRgb, textRgb }: ProfileDropdownProps) {
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if clicking the toggle button
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    
    // We add a tiny timeout so the click that opened it doesn't immediately close it if propogated loosely
    if (isOpen) {
      setTimeout(() => document.addEventListener('mousedown', handleClickOutside), 10)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  // Glassmorphism baseline
  const bgColor = bgRgb ? `rgba(${bgRgb}, 0.95)` : 'rgba(255, 255, 255, 0.95)'
  const textColor = textRgb ? `rgb(${textRgb})` : '#111827' // gray-900
  const borderColor = textRgb ? `rgba(${textRgb}, 0.1)` : 'rgba(0,0,0,0.05)'
  const hoverBg = textRgb ? `rgba(${textRgb}, 0.05)` : 'rgba(0,0,0,0.04)'
  const subtleTextColor = textRgb ? `rgba(${textRgb}, 0.6)` : '#6b7280' // gray-500

  const { data: session } = authClient.useSession()

  const email = userEmail || session?.user?.email || 'user@storeville.com'
  const computedName = session?.user?.name || null
  const name = userName || computedName || 'Storeville Member'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
           ref={dropdownRef}
           initial={{ opacity: 0, scale: 0.95, y: -10 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.95, y: -10 }}
           transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
           className="absolute right-0 mt-3 w-72 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] backdrop-blur-2xl border z-[200] overflow-hidden"
           style={{ backgroundColor: bgColor, color: textColor, borderColor }}
        >
          {/* Top Section */}
          <div className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border shadow-inner flex flex-col items-center justify-center p-0.5" style={{ backgroundColor: hoverBg, borderColor }}>
               <div className="w-full h-full rounded-full flex items-center justify-center bg-white/50 backdrop-blur-sm" style={{ color: textColor }}>
                 <User size={20} style={{ opacity: 0.8 }} />
               </div>
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-base font-bold tracking-tight truncate leading-tight">{name}</p>
               <p className="text-xs font-medium truncate mt-0.5" style={{ color: subtleTextColor }}>{email}</p>
            </div>
          </div>

          <div className="w-full h-px" style={{ backgroundColor: borderColor }}></div>

          {/* Menu Items */}
          <div className="p-2 space-y-1">
            {/* 🌟 MERCHANT ONBOARDING CTA (Only for Customers) */}
            {(session?.user as any)?.role === 'CUSTOMER' && (
              <button 
                onClick={() => { router.push('/stores/launch'); onClose(); }} 
                className="w-full text-left px-3 py-3 text-sm font-bold text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 flex items-center gap-3 group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-gray-900/20 mb-1 border border-gray-200/50"
              >
                <div className="bg-white p-1.5 rounded-lg shadow-sm group-hover:scale-110 transition-transform border border-gray-200">
                  <Rocket size={18} className="text-gray-900 fill-gray-100" />
                </div>
                <span className="relative z-10 flex flex-col">
                  Launch Your Store
                  <span className="text-[10px] font-medium text-gray-500 opacity-90 -mt-0.5">Start Selling on StoreVille</span>
                </span>
              </button>
            )}

            <button onClick={() => { router.push('/profile'); onClose(); }} className="w-full text-left px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-3 group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-gray-900/20">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: hoverBg }}></div>
              <User size={18} className="relative z-10 transition-opacity" style={{ color: subtleTextColor }} /> 
              <span className="relative z-10">My Dashboard</span>
            </button>

            <button onClick={() => { router.push('/profile?tab=track_order'); onClose(); }} className="w-full text-left px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-3 group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-gray-900/20">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: hoverBg }}></div>
              <MapPin size={18} className="relative z-10 transition-opacity" style={{ color: subtleTextColor }} /> 
              <span className="relative z-10">Track Order</span>
            </button>

            {/* <button onClick={() => { router.push('/profile'); onClose(); }} className="w-full text-left px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-3 group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-gray-900/20">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: hoverBg }}></div>
              <Heart size={18} className="relative z-10 transition-opacity" style={{ color: subtleTextColor }} /> 
              <span className="relative z-10">Wishlist</span>
            </button> */}

            {/* <button onClick={() => { router.push('/profile'); onClose(); }} className="w-full text-left px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-3 group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-gray-900/20">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: hoverBg }}></div>
              <MapPin size={18} className="relative z-10 transition-opacity" style={{ color: subtleTextColor }} /> 
              <span className="relative z-10">My Addresses</span>
            </button> */}

            <button onClick={() => { router.push('/profile'); onClose(); }} className="w-full text-left px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-3 group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-gray-900/20">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: hoverBg }}></div>
              <Settings size={18} className="relative z-10 transition-opacity" style={{ color: subtleTextColor }} /> 
              <span className="relative z-10">Account Settings</span>
            </button>

            <button onClick={() => { router.push('/profile'); onClose(); }} className="w-full text-left px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-3 group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-gray-900/20">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: hoverBg }}></div>
              <Headphones size={18} className="relative z-10 transition-opacity" style={{ color: subtleTextColor }} /> 
              <span className="relative z-10">Customer Support</span>
            </button>
          </div>

          <div className="w-full h-px" style={{ backgroundColor: borderColor }}></div>

          {/* Logout */}
          <div className="p-2">
             <button 
                onClick={() => { onSignOut(); onClose(); }} 
                className="w-full text-left px-3 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-700 hover:shadow-sm rounded-xl transition-all duration-200 flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-red-500/30"
             >
                <LogOut size={18} /> Sign Out
             </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

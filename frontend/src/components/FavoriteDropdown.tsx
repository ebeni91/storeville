import React, { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Heart, X, ShoppingBag, ExternalLink, ArrowRight } from 'lucide-react'
import { useFavoriteStore } from '@/store/favoriteStore'

export default function FavoriteDropdown({ 
  isOpen, 
  onClose,
  bgRgb = "255, 255, 255",
  textRgb = "17, 24, 39"
}: { 
  isOpen: boolean, 
  onClose: () => void,
  bgRgb?: string,
  textRgb?: string
}) {
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const { favorites, toggleFavorite } = useFavoriteStore()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-0 top-14 w-80 rounded-[1.5rem] shadow-2xl border backdrop-blur-2xl overflow-hidden z-[400] flex flex-col"
          style={{ 
            backgroundColor: `rgba(${bgRgb}, 0.95)`, 
            borderColor: `rgba(${textRgb}, 0.1)`,
            color: `rgb(${textRgb})`
          }}
        >
          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: `rgba(${textRgb}, 0.1)` }}>
            <h3 className="font-black tracking-tight flex items-center gap-2">
              <Heart size={16} className="text-red-500 fill-red-500" /> My Wishlist
            </h3>
            <span className="text-xs font-bold opacity-60 bg-black/5 px-2 py-1 rounded-md">{favorites.length} Items</span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[400px] p-2 hide-scrollbar">
            {favorites.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center opacity-50 text-center px-6">
                <Heart size={32} className="mb-3 opacity-20" />
                <p className="text-sm font-bold">Your wishlist is empty</p>
                <p className="text-xs mt-1">Tap the heart on any product to save it for later.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {favorites.map(item => (
                  <div key={item.id} className="flex gap-3 items-center p-2 rounded-xl hover:bg-black/5 transition-colors cursor-pointer group"
                    onClick={() => router.push('/dashboard/buyer')}
                  >
                    <div className="w-12 h-12 rounded-lg bg-black/5 overflow-hidden shrink-0">
                      {item.image ? (
                        <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-20"><ShoppingBag size={16}/></div>
                      )}
                    </div>
                    
                    <div className="flex-1 overflow-hidden">
                      <h4 className="text-xs font-bold truncate">{item.name}</h4>
                      {item.storeName && (
                        <p className="text-[10px] font-semibold opacity-60 flex items-center gap-1 mt-0.5 truncate">
                          <ExternalLink size={10} /> {item.storeName}
                        </p>
                      )}
                    </div>

                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleFavorite({ id: item.productId }, item.type) }}
                      className="p-2 opacity-50 hover:opacity-100 hover:text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {favorites.length > 0 && (
            <div className="p-3 border-t bg-black/5" style={{ borderColor: `rgba(${textRgb}, 0.05)` }}>
              <button 
                onClick={() => router.push('/dashboard/buyer')}
                className="w-full py-3 rounded-xl text-xs font-black tracking-widest uppercase hover:bg-black/10 transition-colors flex items-center justify-center gap-2"
              >
                Go to Profile Wishlist <ArrowRight size={14} />
              </button>
            </div>
          )}

          <style dangerouslySetInnerHTML={{__html: `.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

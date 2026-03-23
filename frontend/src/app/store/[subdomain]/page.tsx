'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { Loader2, AlertCircle } from 'lucide-react'

// 🌟 PREPARING THE MODULAR IMPORTS
// We will build these two specialized engines next. 
// For now, we will render a placeholder block if they aren't created yet.
import FoodStorefront from '@/components/storefront/FoodStorefront'
import RetailStorefront from '@/components/storefront/RetailStorefront'
export default function StorefrontGateway() {
  const params = useParams()
  const subdomain = params.subdomain as string
  
  // Core Store State (Preserved)
  const [store, setStore] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch the Store profile from Django using the subdomain
  useEffect(() => {
    const fetchStore = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Query the core stores app to get the routing information
        const response = await api.get(`/stores/discovery/by_slug/?slug=${subdomain}`)
        
        if (response.data) {
          setStore(response.data)
        } else {
          throw new Error("Store data is empty")
        }
      } catch (err: any) {
        console.error("Store Fetch Error:", err)
        setError('Store not found or is currently unavailable.')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (subdomain) {
      fetchStore()
    }
  }, [subdomain])

  // 1. Loading State (Preserving your UI/UX standards)
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50">
        <Loader2 size={40} className="text-indigo-600 animate-spin mb-4" />
        <p className="font-black tracking-widest uppercase text-sm text-gray-400 animate-pulse">
          Connecting to {subdomain}...
        </p>
      </div>
    )
  }

  // 2. Error State (If the subdomain doesn't exist in Django)
  if (error || !store) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 px-4 text-center">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 max-w-md w-full">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-gray-900 mb-2">Store Not Found</h1>
          <p className="text-sm font-medium text-gray-500">
            {error || `The store "${subdomain}" does not exist on StoreVille.`}
          </p>
        </div>
      </div>
    )
  }

  // ==============================================================================
  // 🌟 THE ARCHITECTURAL SPLIT: ROUTING TRAFFIC BASED ON STORE TYPE
  // ==============================================================================

  // A. The Food & Coffee Engine
  if (store.store_type === 'FOOD') {
    return <FoodStorefront store={store} />
  }

  // B. The Retail & Goods Engine
  if (store.store_type === 'RETAIL') {
    return <RetailStorefront store={store} />
  }

  // Fallback for corrupted data
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-600 font-bold">
      CRITICAL ERROR: Unknown Store Type "{store.store_type}"
    </div>
  )
}
import { AlertCircle } from 'lucide-react'
import FoodStorefront from '@/components/storefront/FoodStorefront'
import RetailStorefront from '@/components/storefront/RetailStorefront'

export default async function StorefrontGateway({ params }: { params: { subdomain: string } }) {
  const subdomain = params.subdomain
  
  let store: any = null
  let error: string | null = null
  
  try {
    const djangoUrl = process.env.DJANGO_INTERNAL_URL || 'http://backend:8000'
    const res = await fetch(`${djangoUrl}/api/stores/discovery/by_slug/?slug=${subdomain}`, {
      // Allow slight caching in production for extreme performance, revalidating every 10 seconds
      next: { revalidate: 10 }
    })
    
    if (res.ok) {
      store = await res.json()
    } else {
      error = "Store not found."
    }
  } catch (err) {
    console.error("SSR Store Fetch Error:", err)
    error = "Service unavailable."
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
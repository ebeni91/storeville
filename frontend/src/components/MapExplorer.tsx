'use client'

import dynamic from 'next/dynamic'
import { Store } from '@/lib/api'

const MapCoreDynamic = dynamic(() => import('@/components/MapCore'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
      <div className="w-12 h-12 rounded-full border-4 border-gray-900/20 border-t-gray-900 animate-spin mb-4"></div>
      <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">Loading Map…</p>
    </div>
  )
})

interface MapExplorerProps {
  mode?: 'retail' | 'food'
  onStoreClick?: (store: Store) => void
}

export default function MapExplorer({ mode = 'retail', onStoreClick }: MapExplorerProps) {
  return (
    <div className="w-full h-full relative z-0">
      <MapCoreDynamic mode={mode} onStoreClick={onStoreClick} />
    </div>
  )
}
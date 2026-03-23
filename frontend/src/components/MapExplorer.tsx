'use client'

import dynamic from 'next/dynamic'

// 🌟 THE FIX: Dynamically import your MapCore component with SSR disabled.
// This completely stops the map from vibrating/shaking during zoom and scroll.
const MapCoreDynamic = dynamic(() => import('@/components/MapCore'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mb-4"></div>
      <p className="text-indigo-900 font-bold tracking-widest uppercase text-xs">Booting Map Engine...</p>
    </div>
  )
})

interface MapExplorerProps {
  mode?: 'retail' | 'food'
}

export default function MapExplorer({ mode = 'retail' }: MapExplorerProps) {
  return (
    <div className="w-full h-full relative rounded-[2rem] overflow-hidden z-0">
      <MapCoreDynamic mode={mode} />
    </div>
  )
}
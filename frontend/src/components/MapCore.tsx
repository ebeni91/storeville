'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useQuery } from '@tanstack/react-query'
import { fetchNearbyStores, Store } from '@/lib/api'
import { LocateFixed, Store as StoreIcon, Navigation, ArrowRight } from 'lucide-react'

const DEFAULT_VIEWPORT = {
  latitude: 8.9806,
  longitude: 38.7578,
  zoom: 14 
}

interface MapCoreProps {
  mode?: 'retail' | 'food'
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, 15, { animate: true, duration: 1.5 })
  }, [center, map])
  return null
}

export default function MapCore({ mode = 'retail' }: MapCoreProps) {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [userLoc, setUserLoc] = useState<[number, number]>([DEFAULT_VIEWPORT.latitude, DEFAULT_VIEWPORT.longitude])
  const [isLocating, setIsLocating] = useState(false)
  
  const modeColorClass = mode === 'food' ? 'bg-orange-500' : 'bg-indigo-600'
  const modeHoverClass = mode === 'food' ? 'hover:bg-orange-600' : 'hover:bg-indigo-700'
  const spinnerColor = mode === 'food' ? 'border-orange-500' : 'border-indigo-600'

  const createCustomIcon = (isUser = false) => {
    const iconHtml = isUser 
      ? `<div class="bg-blue-500 text-white p-1.5 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] ring-4 ring-blue-500/30 flex items-center justify-center w-6 h-6">
          <div class="w-full h-full bg-white rounded-full animate-pulse"></div>
         </div>`
      : `<div class="${modeColorClass} text-white p-2 rounded-full shadow-lg ring-2 ring-white flex items-center justify-center w-9 h-9 transform hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path>
            <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"></path>
            <path d="M12 3v6"></path>
          </svg>
        </div>`

    return L.divIcon({
      html: iconHtml,
      className: 'custom-leaflet-icon bg-transparent border-none',
      iconSize: isUser ? [24, 24] : [36, 36],
      iconAnchor: isUser ? [12, 12] : [18, 36], 
      popupAnchor: [0, -36] 
    })
  }

  const { data: stores, isLoading } = useQuery({
    queryKey: ['stores', userLoc[0], userLoc[1], mode],
    queryFn: () => fetchNearbyStores(userLoc[0], userLoc[1], 15, mode),
  })

  const locateUser = () => {
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc([pos.coords.latitude, pos.coords.longitude])
        setIsLocating(false)
      },
      (err) => {
        console.error("GPS Error:", err)
        alert("Could not find your location. Please ensure location services are enabled.")
        setIsLocating(false)
      }
    )
  }

  return (
    <div className="w-full h-full relative bg-gray-100 z-0">
      
      <button 
        onClick={locateUser} 
        disabled={isLocating}
        className="absolute bottom-6 right-6 z-[1000] bg-white p-3.5 rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:scale-105 transition-all text-gray-700 hover:text-indigo-600 disabled:opacity-50 border border-gray-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
      >
        <LocateFixed size={22} className={isLocating ? 'animate-spin text-indigo-600' : ''} />
      </button>

      <MapContainer
        center={userLoc}
        zoom={DEFAULT_VIEWPORT.zoom}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', zIndex: 10 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController center={userLoc} />

        <Marker position={userLoc} icon={createCustomIcon(true)}>
          <Popup className="rounded-2xl border-none shadow-xl">
            <p className="font-bold text-xs text-center py-1">You are here</p>
          </Popup>
        </Marker>

        {stores?.map((store) => (
          <Marker
            key={store.id}
            position={[store.latitude, store.longitude]}
            icon={createCustomIcon()}
            eventHandlers={{ click: () => setSelectedStore(store) }}
          >
            <Popup className="rounded-[1.5rem] overflow-hidden border-none shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] p-0 m-0 custom-popup">
              <div className="p-3 text-center min-w-[200px] bg-white">
                <div className="w-full h-28 bg-gray-50 rounded-xl mb-4 overflow-hidden border border-gray-100">
                  {store.logo ? (
                    <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                       <StoreIcon size={32} />
                    </div>
                  )}
                </div>
                
                <h3 className="font-black text-xl text-gray-900 leading-tight mb-1 tracking-tight line-clamp-1">{store.name}</h3>
                
                <div className="flex items-center justify-center gap-2 mb-4">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md">{store.category || "General"}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md flex items-center gap-1">
                    <Navigation size={10} /> {(store.distance || 0).toFixed(1)} km
                  </p>
                </div>

                <a
                  // 🌟 NEW: Standard relative path!
                  href={`/store/${store.slug}`}
                  className={`flex items-center justify-center gap-2 w-full ${modeColorClass} text-white text-[11px] font-black tracking-widest uppercase py-3.5 rounded-xl shadow-lg ${modeHoverClass} transition-all transform hover:-translate-y-0.5 focus:ring-4 focus:ring-indigo-500/30`}
                >
                  Visit Store <ArrowRight size={14} />
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {isLoading && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-md px-6 py-2.5 rounded-full shadow-lg text-xs font-black uppercase tracking-widest text-gray-700 flex items-center gap-3 border border-white">
          <div className={`w-4 h-4 border-[3px] ${spinnerColor} border-t-transparent rounded-full animate-spin`}></div>
          Scanning Area...
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-popup-content-wrapper { padding: 0 !important; border-radius: 1.5rem !important; overflow: hidden; }
        .leaflet-popup-content { margin: 0 !important; width: auto !important; }
        .leaflet-popup-tip { box-shadow: 0 20px 40px -15px rgba(0,0,0,0.2); }
        .custom-popup a { outline: none; }
      `}} />
    </div>
  )
}
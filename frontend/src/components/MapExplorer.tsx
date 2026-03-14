'use client'

import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useQuery } from '@tanstack/react-query'
import { fetchNearbyStores, Store } from '@/lib/api'
import ReactDOMServer from 'react-dom/server'
import { Store as StoreIcon } from 'lucide-react'

const DEFAULT_VIEWPORT = {
  latitude: 8.9806,
  longitude: 38.7578,
  zoom: 13
}

interface MapExplorerProps {
  mode?: 'retail' | 'food'
}

export default function MapExplorer({ mode = 'retail' }: MapExplorerProps) {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)

  const modeColorClass = mode === 'food' ? 'bg-orange-500' : 'bg-indigo-600'
  const modeHoverClass = mode === 'food' ? 'hover:bg-orange-600' : 'hover:bg-indigo-700'
  const spinnerColor = mode === 'food' ? 'border-orange-500' : 'border-indigo-600'

  // Custom Leaflet DivIcon to use our Tailwind styles and Lucide Icons
  const createCustomIcon = () => {
    const iconHtml = ReactDOMServer.renderToString(
      <div className={`${modeColorClass} text-white p-2 rounded-full shadow-lg ring-2 ring-white flex items-center justify-center`} style={{ width: '36px', height: '36px' }}>
        <StoreIcon size={18} />
      </div>
    )

    return L.divIcon({
      html: iconHtml,
      className: 'custom-leaflet-icon bg-transparent border-none',
      iconSize: [36, 36],
      iconAnchor: [18, 36], // Anchor to bottom center
      popupAnchor: [0, -36] // Popup opens above the icon
    })
  }

  const { data: stores, isLoading } = useQuery({
    queryKey: ['stores', DEFAULT_VIEWPORT.latitude, DEFAULT_VIEWPORT.longitude, mode],
    // Passing the mode to the Django backend filter
    queryFn: () => fetchNearbyStores(DEFAULT_VIEWPORT.latitude, DEFAULT_VIEWPORT.longitude, 15, mode),
  })

  return (
    <div className="w-full h-full relative bg-gray-100 z-0 rounded-[2.5rem]">
      {/* Leaflet Map */}
      <MapContainer
        center={[DEFAULT_VIEWPORT.latitude, DEFAULT_VIEWPORT.longitude]}
        zoom={DEFAULT_VIEWPORT.zoom}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', zIndex: 10, borderRadius: '2.5rem' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {stores?.map((store) => (
          <Marker
            key={store.id}
            position={[store.latitude, store.longitude]}
            icon={createCustomIcon()}
            eventHandlers={{
              click: () => setSelectedStore(store),
            }}
          >
            <Popup className="rounded-2xl overflow-hidden border-none shadow-xl">
              <div className="p-1 text-center min-w-[160px]">
                <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1">{store.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{store.category}</p>
                <div className="bg-gray-100 text-gray-700 text-[10px] uppercase tracking-wider font-bold py-1 px-3 rounded-full mb-3 inline-block">
                  {store.distance.toFixed(2)} km away
                </div>
                <a
                  href={`http://${store.slug}.storeville.app:3000`}
                  className={`block w-full ${modeColorClass} text-white text-sm font-bold py-2 rounded-lg shadow-md ${modeHoverClass} transition-colors`}
                >
                  Visit Store
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {isLoading && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-md px-6 py-2 rounded-full shadow-lg text-sm font-bold text-gray-700 flex items-center gap-2">
          <div className={`w-4 h-4 border-2 ${spinnerColor} border-t-transparent rounded-full animate-spin`}></div>
          Scanning area...
        </div>
      )}
    </div>
  )
}
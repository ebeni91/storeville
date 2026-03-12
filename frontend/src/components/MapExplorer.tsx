'use client'

import { useState } from 'react'
// THE V8 FIX: Notice the /mapbox at the end of this string!
import Map, { Marker, Popup } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useQuery } from '@tanstack/react-query'
import { fetchNearbyStores, Store } from '@/lib/api'
import { Store as StoreIcon } from 'lucide-react'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

const DEFAULT_VIEWPORT = {
  latitude: 8.9806,
  longitude: 38.7578,
  zoom: 12
}

export default function MapExplorer() {
  const [viewState, setViewState] = useState(DEFAULT_VIEWPORT)
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)

  const { data: stores, isLoading } = useQuery({
    queryKey: ['stores', viewState.latitude, viewState.longitude],
    queryFn: () => fetchNearbyStores(viewState.latitude, viewState.longitude, 15),
  })

  if (!MAPBOX_TOKEN) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md border border-red-300 shadow-sm">
        <strong className="font-bold">Missing Mapbox Token:</strong> Please add <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> to your <code>.env.local</code> file in the frontend directory.
      </div>
    )
  }

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden shadow-lg relative border border-gray-200">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        {stores?.map((store) => (
          <Marker 
            key={store.id} 
            latitude={store.latitude} 
            longitude={store.longitude}
            anchor="bottom"
            onClick={e => {
              e.originalEvent.stopPropagation()
              setSelectedStore(store)
            }}
          >
            <div className="bg-primary text-white p-2 rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform">
              <StoreIcon size={20} />
            </div>
          </Marker>
        ))}

        {selectedStore && (
          <Popup
            latitude={selectedStore.latitude}
            longitude={selectedStore.longitude}
            anchor="top"
            onClose={() => setSelectedStore(null)}
            closeOnClick={false}
          >
            <div className="p-2 text-center min-w-[150px]">
              <h3 className="font-bold text-lg text-gray-900">{selectedStore.name}</h3>
              <p className="text-sm text-gray-500 mb-2">{selectedStore.category}</p>
              <div className="bg-blue-50 text-primary text-xs font-semibold py-1 px-2 rounded-md mb-3 inline-block">
                {selectedStore.distance.toFixed(2)} km away
              </div>
              <a 
                href={`http://${selectedStore.slug}.storeville.app:3000`} 
                className="block w-full bg-primary text-white text-sm font-medium py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Visit Store
              </a>
            </div>
          </Popup>
        )}
      </Map>
      
      {isLoading && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-md shadow-md text-sm font-semibold text-primary flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          Scanning area...
        </div>
      )}
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useQuery } from '@tanstack/react-query'
import { api, Store } from '@/lib/api'
import { LocateFixed } from 'lucide-react'

interface MapCoreProps {
  mode?: 'retail' | 'food'
  onStoreClick?: (store: Store) => void
}

// Fits the map viewport upon initialization or explicit user locate requests
function MapController({ stores, userLoc, locateTrigger }: { stores?: Store[], userLoc: [number, number] | null, locateTrigger: number }) {
  const map = useMap()
  const [hasFitStores, setHasFitStores] = useState(false)
  const [hasLocatedUser, setHasLocatedUser] = useState(false)

  // 1. Autocorrect to fit all known stores initially if we don't have user location yet
  useEffect(() => {
    if (!hasFitStores && stores !== undefined && stores.length > 0 && !hasLocatedUser) {
      const validCoords: [number, number][] = stores
        .filter(s => s.latitude && s.longitude)
        .map(s => [Number(s.latitude), Number(s.longitude)])

      if (validCoords.length > 0) {
        const bounds = L.latLngBounds(validCoords)
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14, animate: true, duration: 1.2 })
      }
      setHasFitStores(true)
    }
  }, [stores, map, hasFitStores, hasLocatedUser])

  // 2. Fly to user location automatically ONCE when it resolves (overrides store view)
  useEffect(() => {
    if (userLoc && !hasLocatedUser) {
      // Platform focuses on local discovery: target ~15-20km radius around user
      map.flyTo(userLoc, 13, { animate: true, duration: 1.2 })
      setHasLocatedUser(true)
    }
  }, [userLoc, map, hasLocatedUser])

  // 3. Explicit User Hardware Location Request (Button Click)
  useEffect(() => {
    if (locateTrigger > 0 && userLoc) {
      map.flyTo(userLoc, 14, { animate: true, duration: 1.2 }) // Zoom in slightly closer on direct prompt
    }
  }, [locateTrigger, userLoc, map])

  return null
}

export default function MapCore({ mode = 'retail', onStoreClick }: MapCoreProps) {
  const [userLoc, setUserLoc] = useState<[number, number] | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [locateTrigger, setLocateTrigger] = useState(0)

  const isFood = mode === 'food'
  const accentColor = isFood ? '#f97316' : '#111827'

  // Auto-request live location once on mount
  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLoc([pos.coords.latitude, pos.coords.longitude]),
      () => setUserLoc(null), // Permission denied: fine, map will still show stores
      { timeout: 8000 }
    )
  }, [])

  // Fetch ALL active stores — no radius, no lat/lon dependency
  const { data: stores, isLoading } = useQuery({
    queryKey: ['all-stores', mode],
    queryFn: async () => {
      const storeType = isFood ? 'FOOD' : 'RETAIL'
      const response = await api.get(`/stores/discovery/?type=${storeType}`)
      return (response.data.results || response.data) as Store[]
    },
    staleTime: 5 * 60 * 1000,
  })

  const createCustomIcon = (isUser = false) => {
    const iconHtml = isUser
      ? `<div style="position:relative;width:22px;height:22px;">
          <div style="position:absolute;width:22px;height:22px;background:rgba(17,24,39,0.2);border-radius:50%;top:0;left:0;animation:ripple 1.8s ease-out infinite;"></div>
          <div style="position:absolute;width:14px;height:14px;background:#111827;border:2.5px solid #fff;border-radius:50%;top:4px;left:4px;box-shadow:0 2px 8px rgba(17,24,39,0.4);"></div>
         </div>`
      : `<div style="position:relative;width:46px;height:54px;cursor:pointer;">
          <div style="width:46px;height:46px;border-radius:50%;background:#fff;border:2.5px solid ${accentColor};display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,0.15);position:relative;z-index:1;">
            <div style="width:32px;height:32px;border-radius:50%;background:${accentColor};display:flex;align-items:center;justify-content:center;">
              ${isFood
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`
        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`}
            </div>
          </div>
          <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:10px;height:10px;background:${accentColor};clip-path:polygon(50% 100%,0% 0%,100% 0%);"></div>
        </div>`

    return L.divIcon({
      html: iconHtml,
      className: 'custom-leaflet-icon bg-transparent border-none',
      iconSize: isUser ? [22, 22] : [46, 54],
      iconAnchor: isUser ? [11, 11] : [23, 54],
      popupAnchor: [0, -54]
    })
  }

  const locateUser = () => {
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc([pos.coords.latitude, pos.coords.longitude])
        setLocateTrigger(prev => prev + 1)
        setIsLocating(false)
      },
      (err) => {
        console.error('GPS Error:', err)
        setIsLocating(false)
      }
    )
  }

  // Use a safe fallback center for Leaflet's initial render before geolocation resolves
  const mapCenter: [number, number] = userLoc || [9.0, 38.75]

  return (
    <div className="w-full h-full relative z-0">
      {/* Locate Me button — z-[2000] keeps it above all Leaflet layers (max ~1000) on all screen sizes.
          bottom-24 on mobile clears the 'Shop Retail / Food & Coffee' chip strip (which is at bottom-6, ~56px tall).
          bottom-10 on desktop where there are no chips overlapping. */}
      <button
        onClick={locateUser}
        disabled={isLocating}
        className="absolute bottom-24 right-4 md:bottom-10 md:right-6 z-[2000] bg-black p-3 md:p-3.5 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:bg-gray-900 active:scale-95 transition-all text-white border border-white/20"
        style={{ isolation: 'isolate' }}
        aria-label="Locate me"
      >
        <LocateFixed size={20} className={isLocating ? 'animate-spin opacity-50' : 'text-white'} />
      </button>

      <MapContainer
        center={mapCenter}
        zoom={5}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', zIndex: 10 }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          maxZoom={20}
        />

        {/* Auto-fit and Locate Manager */}
        <MapController stores={stores} userLoc={userLoc} locateTrigger={locateTrigger} />

        {/* User location marker — only when we have a real GPS fix */}
        {userLoc && <Marker position={userLoc} icon={createCustomIcon(true)} />}

        {/* Store markers */}
        {stores?.map((store) =>
          store.latitude && store.longitude ? (
            <Marker
              key={store.id}
              position={[Number(store.latitude), Number(store.longitude)]}
              icon={createCustomIcon()}
              eventHandlers={{
                click: () => {
                  if (onStoreClick) onStoreClick(store)
                }
              }}
            />
          ) : null
        )}
      </MapContainer>

      {isLoading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] bg-white/95 backdrop-blur-md px-6 py-3 rounded-full shadow-lg text-xs font-black uppercase tracking-widest text-gray-700 flex items-center gap-3 border border-white">
          <div className="w-4 h-4 border-[3px] border-t-transparent rounded-full animate-spin" style={{ borderColor: accentColor, borderTopColor: 'transparent' }}></div>
          Loading Stores...
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes ripple { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(2.5); opacity: 0; } }
        .leaflet-control-attribution { display: none !important; }
        .leaflet-control-zoom { display: none !important; }
      `}} />
    </div>
  )
}
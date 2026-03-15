'use client'

import { useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { LocateFixed, Loader2 } from 'lucide-react'

// Custom Map Pin using SVG
const pinHtml = `
  <div class="text-red-500 drop-shadow-xl" style="display: flex; justify-content: center; align-items: center; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="#EF4444" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
      <circle cx="12" cy="10" r="3" fill="white"></circle>
    </svg>
  </div>
`

const pinIcon = L.divIcon({
  html: pinHtml,
  className: 'bg-transparent border-none',
  iconSize: [48, 48],
  iconAnchor: [24, 48],
})

// Component that listens to map clicks and moves the pin
function MapEvents({ setLocation }: { setLocation: (loc: {lat: number, lng: number}) => void }) {
  useMapEvents({
    click(e) {
      setLocation({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

// Custom GPS Locate Button Component
function LocateControl({ setLocation }: { setLocation: (loc: {lat: number, lng: number}) => void }) {
  const map = useMap()
  const [isLocating, setIsLocating] = useState(false)

  const handleLocateClick = () => {
    setIsLocating(true)
    
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.")
      setIsLocating(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        // Update the pin state
        setLocation({ lat: latitude, lng: longitude })
        // Animate the map flying to the new coordinates
        map.flyTo([latitude, longitude], 16, { duration: 1.5 })
        setIsLocating(false)
      },
      (error) => {
        console.error("GPS Error:", error)
        alert("Could not get your location. Please ensure location permissions are granted.")
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div className="absolute bottom-4 right-4 z-[400]">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault() // Prevent form submission
          handleLocateClick()
        }}
        disabled={isLocating}
        title="Find my location"
        className="bg-white p-3 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 flex items-center justify-center transition-all group active:scale-95 disabled:opacity-80"
      >
        {isLocating ? (
          <Loader2 size={24} className="text-primary animate-spin" />
        ) : (
          <LocateFixed size={24} className="text-gray-600 group-hover:text-primary transition-colors" />
        )}
      </button>
    </div>
  )
}

export default function LocationPicker({ location, setLocation }: { location: {lat: number, lng: number}, setLocation: any }) {
  return (
    <div className="relative w-full h-full">
      <MapContainer 
        center={[location.lat, location.lng]} 
        zoom={13} 
        style={{ height: '100%', width: '100%', zIndex: 10 }}
        zoomControl={false} // Disable default zoom so it doesn't clutter our UI
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker 
          position={[location.lat, location.lng]} 
          icon={pinIcon} 
          draggable={true}
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target
              const position = marker.getLatLng()
              setLocation({ lat: position.lat, lng: position.lng })
            }
          }}
        />
        <MapEvents setLocation={setLocation} />
        <LocateControl setLocation={setLocation} />
      </MapContainer>
    </div>
  )
}
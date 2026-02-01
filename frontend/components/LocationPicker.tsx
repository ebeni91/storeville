"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default Leaflet icons
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Helper to handle clicks on the map
function MapEventHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface LocationPickerProps {
  onLocationChange: (lat: number, lng: number) => void;
}

export default function LocationPicker({ onLocationChange }: LocationPickerProps) {
  // 📍 Default to Jimma for the picker too
  const defaultPosition: [number, number] = [7.6751, 36.8366];
  const [position, setPosition] = useState<[number, number]>(defaultPosition);
  const [hasGeolocated, setHasGeolocated] = useState<boolean>(false);
  const markerRef = useRef<L.Marker>(null);

  // Keep the map centered when position changes
  function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
      map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
  }

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker) {
          const { lat, lng } = marker.getLatLng();
          setPosition([lat, lng]);
          onLocationChange(lat, lng);
        }
      },
    }),
    [onLocationChange]
  );

  return (
    <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-white/20 relative z-0 shadow-inner">
       <MapContainer center={position} zoom={13} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={position} />
        <Marker
          draggable={true}
          eventHandlers={eventHandlers}
          position={position}
          ref={markerRef}
          icon={icon}
        >
          <Popup>Drag me to your store location!</Popup>
        </Marker>
        <MapEventHandler onLocationSelect={(lat, lng) => {
            setPosition([lat, lng]);
            onLocationChange(lat, lng);
        }} />
      </MapContainer>
      
      {/* Helper text */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center z-[1000] pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-slate-600 shadow-sm border border-slate-200">
          Tap map or drag pin to set location
        </div>
      </div>

      {/* Recenter to My Location control */}
      <button
        type="button"
        onClick={() => {
          if (!navigator.geolocation) { return; }
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const lat = pos.coords.latitude;
              const lng = pos.coords.longitude;
              setPosition([lat, lng]);
              onLocationChange(lat, lng);
              setHasGeolocated(true);
            },
            () => {
              // Ignore errors silently for now
            },
            { enableHighAccuracy: true, timeout: 8000 }
          );
        }}
        className="absolute right-3 top-3 z-[1000] bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:bg-white"
      >
        Recenter to My Location
      </button>

      {/* Attempt geolocation on mount to set initial center */}
      {/* NOTE: Geolocation requires HTTPS in browsers; localhost is allowed. */}
      {/* We try once on mount; users can recenter via the button above. */}
      {typeof window !== "undefined" && (
        <GeolocateOnMount
          onLocated={(lat, lng) => {
            setPosition([lat, lng]);
            onLocationChange(lat, lng);
            setHasGeolocated(true);
          }}
        />
      )}
    </div>
  );
}

function GeolocateOnMount({ onLocated }: { onLocated: (lat: number, lng: number) => void }) {
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        onLocated(lat, lng);
      },
      () => { /* silently ignore */ },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [onLocated]);
  return null;
}
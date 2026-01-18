"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Store } from "../types";
import L from "leaflet";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Forces the map to fly to the new center when location changes
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function StoreMap({ stores, userLocation }: { stores: Store[], userLocation: [number, number] | null }) {
  // 📍 DEFAULT: Jimma Coordinates
  const defaultCenter: [number, number] = [7.6751, 36.8366];
  
  // Use user location if available, otherwise use default
  const center = userLocation || defaultCenter;

  return (
    <div className="h-[500px] w-full rounded-3xl overflow-hidden shadow-xl border border-white/20 relative z-0">
      <MapContainer center={center} zoom={13} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} />

        {/* Show Blue User Dot only if GPS is active */}
        {userLocation && (
          <Marker position={userLocation} icon={
            L.divIcon({
              className: "bg-blue-500 border-2 border-white rounded-full w-4 h-4 shadow-lg animate-pulse",
              iconSize: [16, 16]
            })
          }>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {stores.map((store) => (
          store.latitude && store.longitude ? (
            <Marker key={store.id} position={[store.latitude, store.longitude]} icon={icon}>
              <Popup>
                <div className="p-1">
                  <h3 className="font-bold text-slate-900">{store.name}</h3>
                  <p className="text-xs text-slate-500 mb-2">{store.category}</p>
                  {store.distance && <span className="text-xs font-bold text-green-600 block mb-2">{store.distance} km away</span>}
                  <Link href={`/store/${store.slug}`} className="text-indigo-600 text-xs font-bold flex items-center hover:underline">
                    Visit Store <ArrowRight size={12} className="ml-1"/>
                  </Link>
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>
    </div>
  );
}
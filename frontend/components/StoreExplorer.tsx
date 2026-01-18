"use client";

import { useState } from "react";
import { fetchStores } from "../lib/api";
import { Store } from "../types";
import { LayoutGrid, Map as MapIcon, Navigation, Loader2, ArrowRight, MapPin, XCircle } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const StoreMap = dynamic(() => import("./StoreMap"), { 
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-slate-100 animate-pulse rounded-3xl flex items-center justify-center text-slate-400">Loading Map...</div>
});

export default function StoreExplorer({ initialStores }: { initialStores: Store[] }) {
  const [stores, setStores] = useState<Store[]>(initialStores);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // 📍 Permission Request Logic
  const handleGetLocation = () => {
    if (!navigator.geolocation) { alert("Geolocation not supported"); return; }
    setLoading(true);
    
    // Request permission and get position
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLocation([lat, lng]);
        
        try {
          // Fetch stores near GPS location
          const nearbyStores = await fetchStores(lat, lng, 10);
          setStores(nearbyStores);
          setViewMode("map"); // Auto-switch to map
        } catch (e) { 
          console.error(e); 
        } finally { 
          setLoading(false); 
        }
      },
      (error) => { 
        console.error(error); 
        setPermissionDenied(true); 
        setLoading(false); 
        alert("Please enable location permissions in your browser to use this feature.");
      }
    );
  };

  // 📍 Reset Logic (Show All)
  const handleShowAll = () => {
    setStores(initialStores);
    setLocation(null);
    setViewMode("grid");
  };

  return (
    <div id="browse" className="w-full">
      <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <LayoutGrid className="text-indigo-600" /> {location ? "Stores Near You" : "Browse Stores"}
          </h2>
          <p className="text-slate-500 mt-1">{location ? `Found ${stores.length} stores within 10km.` : "Discover local businesses."}</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-white/40 shadow-sm">
          {!location ? (
            <button onClick={handleGetLocation} disabled={loading || permissionDenied} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${permissionDenied ? "bg-red-100 text-red-500 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
              {permissionDenied ? "Location Denied" : "Find Near Me"}
            </button>
          ) : (
            <button onClick={handleShowAll} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all">
              <XCircle size={16} /> Show All Stores
            </button>
          )}

          <div className="h-6 w-px bg-slate-300 mx-1"></div>
          <button onClick={() => setViewMode("grid")} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:bg-white/50'}`}><LayoutGrid size={20} /></button>
          <button onClick={() => setViewMode("map")} className={`p-2.5 rounded-xl transition-all ${viewMode === 'map' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:bg-white/50'}`}><MapIcon size={20} /></button>
        </div>
      </div>

      {viewMode === "map" ? (
        <StoreMap stores={stores} userLocation={location} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {stores.map((store) => (
            <Link key={store.id} href={`/store/${store.slug}`} className="group bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:bg-white/20 transition-all duration-300 overflow-hidden flex flex-col">
              <div className="h-32 relative flex items-end p-4" style={{ backgroundColor: store.primary_color || '#3b82f6' }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                {store.distance && (
                   <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border border-white/10">
                     <Navigation size={10} className="text-green-400" /> {store.distance} km
                   </div>
                )}
                <div className="relative z-10 w-16 h-16 bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-1 -mb-8 flex-shrink-0 group-hover:scale-105 transition-transform border border-white/50">
                  <div className="w-full h-full bg-slate-50/50 rounded-lg flex items-center justify-center text-slate-500 font-bold text-2xl uppercase border border-slate-200/50">{store.name.substring(0, 2)}</div>
                </div>
              </div>
              <div className="pt-10 p-6 flex-1 flex flex-col">
                <div className="mb-4">
                  <h3 className="font-bold text-xl text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{store.name}</h3>
                  <p className="text-sm font-medium text-slate-400 capitalize flex items-center gap-1.5 mt-1"><span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]" />{store.category}</p>
                  {store.address && <p className="text-xs text-slate-500 mt-2 flex items-center gap-1 truncate"><MapPin size={12} /> {store.address}</p>}
                </div>
                <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between text-sm">
                  <span className="text-slate-600 font-medium bg-white/20 px-3 py-1 rounded-lg border border-white/10">{store.products.length} Products</span>
                  <span className="text-indigo-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">Visit <ArrowRight size={16} /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
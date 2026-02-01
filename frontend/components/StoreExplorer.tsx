"use client";

import { useState } from "react";
import { fetchStores } from "../lib/api";
import { Store } from "../types";
import { 
  LayoutGrid, Map as MapIcon, Navigation, Loader2, 
  ArrowRight, MapPin, XCircle, Sparkles, Search 
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const StoreMap = dynamic(() => import("./StoreMap"), { 
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-slate-100 animate-pulse rounded-3xl flex items-center justify-center text-slate-400">Loading Map...</div>
});

export default function StoreExplorer({ initialStores }: { initialStores: Store[] }) {
  const [stores, setStores] = useState<Store[]>(initialStores || []);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 📍 Permission Request Logic
  const handleGetLocation = () => {
    if (!navigator.geolocation) { alert("Geolocation not supported"); return; }
    setLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLocation([lat, lng]);
        
        try {
          // Fetch stores near GPS location
          const nearbyStores = await fetchStores(lat, lng, 10);
          setStores(nearbyStores);
          setViewMode("map"); // Auto-switch to map view
          
          // Scroll to results
          document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
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
        alert("Please enable location permissions to find stores near you.");
      }
    );
  };

  // Remove show-all: we pivot to location-based discovery only

  return (
    <div className="w-full">
      
      {/* ================= HERO SECTION (Moved Here) ================= */}
      <section className="relative pt-12 pb-20 md:pt-24 md:pb-32 z-10">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-indigo-700 font-bold text-xs uppercase tracking-wide mb-8 shadow-sm backdrop-blur-md">
            <Sparkles size={14} /> The Digital Mall of Ethiopia
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-8 tracking-tight drop-shadow-sm">
            Discover local <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Shops</span> <br/>
            & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">businesses</span>.
          </h1>
          
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Shop directly from your favorite brands or start your own digital store in seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             {/* 🔍 Search Input (Visual Only for now) */}
             <div className="relative w-full sm:w-80 group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-600 transition-colors">
                  <Search size={20} />
                </div>
                <input 
                  type="text" 
                  placeholder="What are you looking for?" 
                  className="w-full pl-11 pr-4 py-4 rounded-2xl border border-white/20 bg-white/50 backdrop-blur-xl shadow-lg shadow-indigo-500/5 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 outline-none transition-all text-lg placeholder:text-slate-500/80"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>

             {/* 📍 FIND STORES NEAR ME BUTTON */}
             <button 
               onClick={handleGetLocation}
               disabled={loading}
               className="w-full sm:w-auto btn-primary py-4 px-8 text-lg shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all bg-indigo-600/90 backdrop-blur-sm flex items-center justify-center gap-2"
             >
               {loading ? <Loader2 className="animate-spin" /> : <MapPin size={20} />}
               Find Stores Near Me
             </button>
          </div>
        </div>
      </section>

      {/* ================= RESULTS SECTION ================= */}
      <div id="results" className="scroll-mt-24">
        {/* Centered View Toggle (shown only after location set) */}
        <div className="flex items-center justify-center mb-10">
          {location && (
            <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-white/40 shadow-sm">
              <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:bg-white/50'}`}><LayoutGrid size={20} /></button>
              <button onClick={() => setViewMode('map')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'map' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:bg-white/50'}`}><MapIcon size={20} /></button>
            </div>
          )}
        </div>

        {/* Content */}
        {!location ? (
          <></>
        ) : viewMode === "map" ? (
          <StoreMap stores={stores} userLocation={location} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {stores.length > 0 ? stores.map((store) => (
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
            )) : (
              <div className="col-span-full text-center py-20 text-slate-500">
                <MapIcon size={48} className="mx-auto mb-4 opacity-20" />
                <p>No stores found near you. Try a wider radius.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
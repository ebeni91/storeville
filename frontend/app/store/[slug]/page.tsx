import { getBaseUrl } from "../../../lib/api";
import { Store } from "../../../types";
import AddToCartBtn from "../../../components/AddToCartBtn";
import Link from "next/link";
import { Store as StoreIcon, Search, ShoppingCart, Filter, Star, ShoppingBag } from "lucide-react";

async function getStore(slug: string): Promise<Store | null> {
  const res = await fetch(`${getBaseUrl()}/api/stores/${slug}/`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

function getPublicImageUrl(url: string | null) {
  if (!url) return null;
  return url.replace("http://backend:8000", "http://localhost:8000");
}

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const store = await getStore(resolvedParams.slug);

  if (!store) return <div className="text-center py-20 font-bold text-2xl text-slate-500">Store Not Found</div>;

  // Default color if none provided
  const themeColor = store.primary_color || '#3b82f6';

  return (
    <div className="min-h-screen pb-20 text-slate-900 pt-20 relative overflow-hidden"> 
      
      {/* ✨ DYNAMIC STORE BACKGROUND (Page-Wide) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* 1. Solid Base to cover global background */}
        <div className="absolute inset-0 bg-slate-50/90" />
        
        {/* 2. Theme Color Ambient Gradient */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{ 
            background: `
              radial-gradient(circle at 0% 0%, ${themeColor} 0%, transparent 50%),
              radial-gradient(circle at 100% 100%, ${themeColor} 0%, transparent 50%)
            `
          }} 
        />

        {/* 3. Theme Colored Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{ 
            backgroundImage: `linear-gradient(to right, ${themeColor} 1px, transparent 1px), linear-gradient(to bottom, ${themeColor} 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(circle at 50% 50%, black 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 40%, transparent 100%)'
          }}
        />
      </div>

      {/* 1. Hero Section */}
      <div className="relative z-10 h-64 md:h-80 w-full overflow-hidden mb-10">
        {/* Header Background */}
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: themeColor }}
        >
           <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:40px_40px]" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>

        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-8">
          <div className="flex items-end gap-6">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-3xl shadow-2xl p-1 rotate-3 flex-shrink-0 transition-transform hover:rotate-0 duration-300">
              <div className="w-full h-full bg-slate-50 rounded-2xl flex items-center justify-center text-4xl font-bold text-slate-400 uppercase border border-slate-100">
                {store.name.substring(0, 2)}
              </div>
            </div>
            <div className="mb-2">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-md mb-2">
                {store.name}
              </h1>
              <div className="flex items-center gap-3 text-white/90 font-medium">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm border border-white/10 capitalize shadow-sm">
                  {store.category}
                </span>
                <span className="flex items-center gap-1 text-sm">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" /> 4.8 Rating
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Controls Bar (Glass) */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          
          {/* Visual Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
            {['All Items', 'New Arrivals', 'Best Sellers', 'Discount'].map((filter, i) => (
              <button 
                key={filter}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap shadow-sm ${
                  i === 0 
                  ? 'text-white shadow-md transform scale-105' 
                  : 'bg-white/40 hover:bg-white/60 text-slate-600 hover:text-indigo-600 border border-white/40 backdrop-blur-sm'
                }`}
                style={i === 0 ? { backgroundColor: themeColor, boxShadow: `0 8px 20px -5px ${themeColor}60` } : {}}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search in store..." 
              className="w-full pl-11 pr-4 py-3 bg-white/40 border border-white/40 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all outline-none backdrop-blur-sm shadow-sm"
            />
          </div>
        </div>

        {/* 3. Product Grid */}
        {store.products.length === 0 ? (
          <div className="bg-white/30 backdrop-blur-lg rounded-3xl p-20 text-center border-2 border-dashed border-white/40">
            <ShoppingBag size={48} className="mx-auto text-slate-400 mb-4 opacity-50" />
            <p className="text-slate-600 text-lg font-medium">This store is stocking up.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {store.products.map((product) => (
              // Glass Card (Transparent to show page background)
              <div 
                key={product.id} 
                className="group relative bg-white/40 backdrop-blur-xl rounded-3xl border border-white/50 shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:bg-white/60 transition-all duration-500 overflow-hidden"
              >
                
                {/* Image Section */}
                <div className="h-64 relative bg-white/30 overflow-hidden m-2 rounded-2xl">
                  {product.image ? (
                    <img 
                      src={getPublicImageUrl(product.image) || ""} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl">📦</div>
                  )}
                  
                  {/* Badge */}
                  {product.stock <= 5 && product.stock > 0 && (
                    <span className="absolute top-3 right-3 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg backdrop-blur-md">
                      Low Stock
                    </span>
                  )}

                  {product.stock <= 0 && (
                     <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                       <span className="text-white font-bold uppercase tracking-widest border-2 border-white/30 px-4 py-2 rounded-xl backdrop-blur-md">Sold Out</span>
                     </div>
                  )}
                </div>
                
                {/* Content Section */}
                <div className="p-5 pt-2">
                  <div className="mb-4">
                    <h3 className="font-bold text-slate-900 mb-1 truncate text-lg group-hover:text-indigo-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{product.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Price</p>
                      <span className="text-xl font-extrabold text-slate-900">
                        {product.price} <span className="text-xs font-medium text-slate-500">ETB</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Interactive Slide-Up Button Overlay */}
                {product.stock > 0 && (
                  <div className="absolute bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur-xl border-t border-white/50 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
                    <AddToCartBtn product={product} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
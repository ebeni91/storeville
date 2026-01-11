import Link from "next/link";
import { fetchStores } from "../lib/api";
import { Store } from "../types";
import { 
  Search, Store as StoreIcon, ArrowRight, ShoppingBag, 
  Sparkles, TrendingUp, LayoutGrid, LogIn 
} from "lucide-react";

export default async function Home() {
  let stores: Store[] = [];
  
  try {
    stores = await fetchStores();
  } catch (e) {
    console.error("Fetch Error", e);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans relative overflow-x-hidden">
      
      {/* ✨ NEW: Modern Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* 1. Subtle Grid Pattern */}
        <div 
          className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
          style={{ maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)' }}
        />
        
        {/* 2. Ambient Aurora Gradients (Softer & Larger) */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-200/40 blur-[100px] animate-pulse" />
        <div className="absolute top-[10%] right-[-5%] w-[40%] h-[50%] rounded-full bg-indigo-200/40 blur-[100px] animate-pulse delay-1000" />
        <div className="absolute top-[40%] left-[20%] w-[60%] h-[40%] rounded-full bg-blue-100/40 blur-[120px] opacity-60" />
      </div>

      {/* 1. Transparent Sticky Navbar */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <StoreIcon size={24} />
            </div>
            <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
              StoreVille
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium transition">
              <LogIn size={18} /> Seller Login
            </Link>
            <Link href="/register" className="btn-primary py-2.5 px-6 text-sm">
              Open Your Store
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-24 pb-32 z-10">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-indigo-100 text-indigo-700 font-bold text-xs uppercase tracking-wide mb-8 shadow-sm backdrop-blur-sm">
            <Sparkles size={14} /> The Digital Mall of Ethiopia
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-8 tracking-tight">
            Discover local <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">creators</span> <br/>
            & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">businesses</span>.
          </h1>
          
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Shop directly from your favorite brands or start your own digital store in seconds. No coding required.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <div className="relative w-full sm:w-96 group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Search size={20} />
                </div>
                <input 
                  type="text" 
                  placeholder="Search stores..." 
                  className="w-full pl-11 pr-4 py-4 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-lg"
                />
             </div>
             <Link href="#browse" className="w-full sm:w-auto btn-primary py-4 px-8 text-lg shadow-xl shadow-indigo-200">
               Explore <ArrowRight size={20} />
             </Link>
          </div>
        </div>
      </section>

      {/* 3. Stats / Trust Banner */}
      <div className="bg-white/50 backdrop-blur-sm border-y border-slate-100 z-10">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
           {[
             { label: "Active Stores", value: stores.length + "+", icon: StoreIcon },
             { label: "Happy Customers", value: "10k+", icon: ShoppingBag },
             { label: "Products", value: "500+", icon: LayoutGrid },
             { label: "Growth", value: "120%", icon: TrendingUp },
           ].map((stat, i) => (
             <div key={i} className="flex flex-col items-center text-center group">
               <div className="mb-3 p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                 <stat.icon size={24} />
               </div>
               <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
               <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">{stat.label}</p>
             </div>
           ))}
        </div>
      </div>

      {/* 4. Store Directory */}
      <main id="browse" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full z-10">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <LayoutGrid className="text-indigo-600" /> Browse Stores
          </h2>
        </div>

        {stores.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <StoreIcon size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No stores open yet</h3>
            <p className="text-slate-500 mb-8">Be the pioneer and launch the first store on StoreVille!</p>
            <Link href="/register" className="btn-primary inline-flex">
              Launch Your Store
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {stores.map((store) => (
              <Link 
                key={store.id} 
                href={`/store/${store.slug}`}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Store Header Color */}
                <div 
                  className="h-32 relative flex items-end p-4"
                  style={{ backgroundColor: store.primary_color || '#3b82f6' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  {/* Store Avatar */}
                  <div className="relative z-10 w-16 h-16 bg-white rounded-xl shadow-md p-1 -mb-8 flex-shrink-0 group-hover:scale-105 transition-transform">
                    <div className="w-full h-full bg-slate-50 rounded-lg flex items-center justify-center text-slate-500 font-bold text-2xl uppercase border border-slate-200">
                      {store.name.substring(0, 2)}
                    </div>
                  </div>
                </div>

                {/* Store Info */}
                <div className="pt-10 p-6 flex-1 flex flex-col">
                  <div className="mb-4">
                    <h3 className="font-bold text-xl text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {store.name}
                    </h3>
                    <p className="text-sm font-medium text-slate-400 capitalize flex items-center gap-1.5 mt-1">
                      <span className="w-2 h-2 rounded-full bg-green-400" />
                      {store.category}
                    </p>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                      {store.products.length} Products
                    </span>
                    <span className="text-indigo-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Visit <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* 5. Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 z-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <StoreIcon size={16} />
            </div>
            <span className="font-bold text-xl text-slate-900">StoreVille</span>
          </div>
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} StoreVille Inc. Built for the future of commerce.
          </p>
        </div>
      </footer>
    </div>
  );
}
import Link from "next/link";
import { fetchStores } from "../lib/api";
import { Store } from "../types";
import { 
  Store as StoreIcon, ArrowRight, ShoppingBag, 
  Sparkles, TrendingUp, LayoutGrid, LogIn, 
  Twitter, Facebook, Instagram, Linkedin, Truck 
} from "lucide-react";
// 👇 This is the component that holds the "missing" grid code + the new map
import StoreExplorer from "../components/StoreExplorer";

export default async function Home() {
  let stores: Store[] = [];
  
  try {
    // Fetch initial stores (server-side) to populate the page fast
    stores = await fetchStores();
  } catch (e) {
    console.error("Fetch Error", e);
  }

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-x-hidden text-slate-900">
      
      {/* 1. Navbar */}
      <nav className="sticky top-0 z-50 bg-white/5 backdrop-blur-lg border-b border-white/10 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600/80 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 backdrop-blur-md">
              <StoreIcon size={24} />
            </div>
            <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
              StoreVille
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/track-order" className="hidden sm:flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium transition">
              <Truck size={18} /> Track Order
            </Link>
            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
            <Link href="/login" className="hidden sm:flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium transition">
              <LogIn size={18} /> Seller Login
            </Link>
            <Link href="/register" className="btn-primary py-2.5 px-6 text-sm bg-indigo-600/90 hover:bg-indigo-700/90 backdrop-blur-sm shadow-indigo-500/30">
              Open Your Store
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-24 pb-32 z-10">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-indigo-700 font-bold text-xs uppercase tracking-wide mb-8 shadow-sm backdrop-blur-md">
            <Sparkles size={14} /> The Digital Mall of Ethiopia
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-8 tracking-tight drop-shadow-sm">
            Discover local <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">creators</span> <br/>
            & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">businesses</span>.
          </h1>
          
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Shop directly from your favorite brands or start your own digital store in seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <Link href="#browse" className="w-full sm:w-auto btn-primary py-4 px-8 text-lg shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all bg-indigo-600/90 backdrop-blur-sm">
               Start Exploring <ArrowRight size={20} />
             </Link>
          </div>
        </div>
      </section>

      {/* 3. Stats Banner */}
      <div className="relative z-10 bg-white/5 backdrop-blur-xl border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
           {[
             { label: "Active Stores", value: stores.length + "+", icon: StoreIcon },
             { label: "Happy Customers", value: "10k+", icon: ShoppingBag },
             { label: "Products", value: "500+", icon: LayoutGrid },
             { label: "Growth", value: "120%", icon: TrendingUp },
           ].map((stat, i) => (
             <div key={i} className="flex flex-col items-center text-center group">
               <div className="mb-3 p-3 bg-white/20 shadow-sm border border-white/20 text-indigo-600 rounded-2xl group-hover:scale-110 group-hover:shadow-md transition-all backdrop-blur-md">
                 <stat.icon size={24} />
               </div>
               <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
               <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{stat.label}</p>
             </div>
           ))}
        </div>
      </div>

      {/* 4. Store Directory (NOW POWERED BY MAP EXPLORER) */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full z-10">
        {/* We pass the initial stores to the client component */}
        <StoreExplorer initialStores={stores} />
      </main>

      {/* 5. Footer */}
      <footer className="bg-white/5 backdrop-blur-2xl border-t border-white/20 pt-16 pb-8 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-indigo-600/90 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 backdrop-blur-md">
                  <StoreIcon size={18} />
                </div>
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">StoreVille</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Empowering Ethiopian creators and businesses with a world-class digital storefront.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-slate-900 mb-4">Shop</h3>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link href="#browse" className="hover:text-indigo-600 transition-colors">Browse Stores</Link></li>
                <li><Link href="#" className="hover:text-indigo-600 transition-colors">Featured Products</Link></li>
                <li><Link href="#" className="hover:text-indigo-600 transition-colors">New Arrivals</Link></li>
                <li><Link href="#" className="hover:text-indigo-600 transition-colors">Categories</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-4">Support</h3>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link href="/track-order" className="hover:text-indigo-600 transition-colors">Track My Order</Link></li>
                <li><Link href="#" className="hover:text-indigo-600 transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-indigo-600 transition-colors">Selling Fees</Link></li>
                <li><Link href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-4">Stay Updated</h3>
              <p className="text-slate-500 text-sm mb-4">Get the latest updates on new stores and features.</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-sm"
                />
                <button className="bg-indigo-600/90 hover:bg-indigo-700/90 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 backdrop-blur-md">
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm font-medium">© {new Date().getFullYear()} StoreVille Inc.</p>
            
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-white/10 transition-all backdrop-blur-sm">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-pink-600 hover:bg-white/10 transition-all backdrop-blur-sm">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-white/10 transition-all backdrop-blur-sm">
                <Linkedin size={18} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
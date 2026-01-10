import { getBaseUrl } from "../../../lib/api";
import { Store } from "../../../types";
import AddToCartBtn from "../../../components/AddToCartBtn";
// import { Store as StoreIcon, Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Store as StoreIcon, Search, ShoppingCart, ShoppingBag } from "lucide-react";
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

  if (!store) return <div className="text-center py-20 font-bold text-2xl">Store Not Found</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* Hero Header */}
      <div 
        className="bg-slate-900 text-white py-20 px-4 text-center relative overflow-hidden"
        style={{ backgroundColor: store.primary_color || '#0f172a' }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-sm mb-6 shadow-2xl border border-white/20">
            <StoreIcon size={40} className="text-white" />
          </div>
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight">{store.name}</h1>
          <p className="text-xl text-white/80 font-medium capitalize flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
            {store.category} Store
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        
        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow-xl p-4 mb-10 flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 px-2 flex items-center gap-2">
            <ShoppingBag size={20} className="text-indigo-600"/> Latest Products
          </h2>
          <div className="flex gap-4 w-full sm:w-auto">
             <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search products..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <Link href={`/store/${store.slug}/cart`} className="btn-primary px-6 whitespace-nowrap">
               <ShoppingCart size={18} /> View Cart
            </Link>
          </div>
        </div>

        {/* Product Grid */}
        {store.products.length === 0 ? (
          <div className="bg-white rounded-2xl p-20 text-center border-dashed border-2 border-slate-200">
            <p className="text-slate-500 text-lg font-medium">This store is stocking up. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {store.products.map((product) => (
              <div key={product.id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full">
                
                {/* Image */}
                <div className="h-64 bg-slate-100 relative overflow-hidden">
                  {product.image ? (
                    <img 
                      src={getPublicImageUrl(product.image) || ""} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <span className="text-5xl">📦</span>
                    </div>
                  )}
                  {product.stock <= 0 && (
                     <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                       <span className="bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg">Out of Stock</span>
                     </div>
                  )}
                </div>
                
                {/* Info */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-slate-500 text-sm mb-6 line-clamp-2 flex-1 leading-relaxed">
                    {product.description}
                  </p>
                  
                  <div className="flex items-end justify-between mt-auto pt-5 border-t border-slate-50">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Price</p>
                      <span className="text-2xl font-bold text-slate-900">
                        {product.price} <span className="text-sm font-bold text-slate-400">ETB</span>
                      </span>
                    </div>
                    {product.stock > 0 && <AddToCartBtn product={product} />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
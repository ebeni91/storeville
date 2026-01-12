"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBaseUrl } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Store } from "../../types";
import Link from "next/link";
import { 
  LayoutDashboard, ShoppingBag, Package, Plus, Trash2, ExternalLink, 
  TrendingUp, DollarSign, Box, LogOut
} from "lucide-react";

export default function Dashboard() {
  const [store, setStore] = useState<Store | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    fetch(`${getBaseUrl()}/api/stores/mine/`, {
      headers: { "Authorization": `Token ${token}` }
    })
    .then((res) => {
      if (res.status === 401 || res.status === 403) throw new Error("Unauthorized");
      return res.json();
    })
    .then((data) => {
      if (!data || !data.id) {
        router.push("/create-store");
      } else {
        setStore(data);
        fetch(`${getBaseUrl()}/api/orders/`, {
          headers: { "Authorization": `Token ${token}` }
        })
        .then(res => res.json())
        .then(orderData => setOrders(orderData))
        .finally(() => setLoading(false));
      }
    })
    .catch(() => router.push("/login"));
  }, [isAuthenticated, token, router]);

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await fetch(`${getBaseUrl()}/api/products/${productId}/`, {
        method: "DELETE",
        headers: { "Authorization": `Token ${token}` },
      });
      if (store) {
        setStore({
          ...store,
          products: store.products.filter((p) => p.id !== productId)
        });
      }
    } catch (err) { alert("Error deleting"); }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 bg-indigo-200/50 rounded-full mb-4 backdrop-blur-sm"></div>
        <div className="h-4 w-32 bg-slate-200/50 rounded backdrop-blur-sm"></div>
      </div>
    </div>
  );
  if (!store) return null;

  return (
    <div className="min-h-screen flex text-slate-900">
      {/* Glass Sidebar */}
      <aside className="w-64 bg-white/10 backdrop-blur-xl border-r border-white/20 hidden md:flex flex-col fixed h-full z-10 shadow-xl">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
            ShopVille
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <div className="px-4 py-3 bg-indigo-50/50 backdrop-blur-sm text-indigo-700 rounded-xl font-semibold flex items-center gap-3 border border-indigo-100/20">
            <LayoutDashboard size={20} /> Dashboard
          </div>
          <div className="px-4 py-3 text-slate-500 hover:bg-white/10 rounded-xl font-medium flex items-center gap-3 cursor-not-allowed opacity-50 transition-colors">
            <TrendingUp size={20} /> Analytics (Soon)
          </div>
        </nav>
        
        {/* User Profile */}
        <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-md">
           <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100/50 flex items-center justify-center text-indigo-700 font-bold text-lg shadow-sm border border-indigo-200/30">
              {store.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">{store.name}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{store.category} Store</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full btn-secondary text-xs h-9 bg-white/20 hover:bg-white/40 border-white/30 backdrop-blur-sm">
            <LogOut size={14}/> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 sm:p-8 max-w-[1600px] mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 drop-shadow-sm">Overview</h2>
            <p className="text-slate-600 mt-1">Here is what's happening with your store today.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <a href={`/store/${store.slug}`} target="_blank" className="btn-secondary flex-1 sm:flex-initial bg-white/30 backdrop-blur-md border-white/30 hover:bg-white/50">
              <ExternalLink size={18} /> View Store
            </a>
            <Link href="/dashboard/add-product" className="btn-primary flex-1 sm:flex-initial bg-indigo-600/90 backdrop-blur-md hover:bg-indigo-700/90">
              <Plus size={18} /> Add Product
            </Link>
          </div>
        </header>

        {/* Stats Grid - Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 flex items-center gap-4 rounded-2xl shadow-sm hover:bg-white/20 transition-all">
            <div className="p-3 bg-blue-100/50 text-blue-600 rounded-xl backdrop-blur-sm">
              <Box size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Products</p>
              <h3 className="text-2xl font-bold text-slate-900">{store.products?.length || 0}</h3>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 flex items-center gap-4 rounded-2xl shadow-sm hover:bg-white/20 transition-all">
            <div className="p-3 bg-purple-100/50 text-purple-600 rounded-xl backdrop-blur-sm">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Revenue</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {orders.reduce((acc, curr) => acc + parseFloat(curr.total_amount), 0).toFixed(2)} ETB
              </h3>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 flex items-center gap-4 rounded-2xl shadow-sm hover:bg-white/20 transition-all">
            <div className="p-3 bg-green-100/50 text-green-600 rounded-xl backdrop-blur-sm">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Orders</p>
              <h3 className="text-2xl font-bold text-slate-900">{orders.length}</h3>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        {orders.length > 0 && (
          <section className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShoppingBag size={20} className="text-slate-500"/> Recent Orders
            </h3>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-sm">
               <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white/10 border-b border-white/10 text-xs uppercase text-slate-500 font-semibold backdrop-blur-md">
                    <tr>
                      <th className="p-4">Order #</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Items</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-white/10 transition-colors">
                        <td className="p-4 font-mono text-xs text-slate-500">#{order.id}</td>
                        <td className="p-4 font-medium">{order.buyer_name}</td>
                        <td className="p-4 text-sm text-slate-600">
                          {order.items.length} items
                        </td>
                        <td className="p-4 font-bold text-green-600">{order.total_amount} ETB</td>
                        <td className="p-4"><span className="badge bg-green-100/50 text-green-700 backdrop-blur-sm">Paid</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Products Section */}
        <section>
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Package size={20} className="text-slate-500"/> Inventory
          </h3>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/10 border-b border-white/10 text-xs uppercase text-slate-500 font-semibold backdrop-blur-md">
                  <tr>
                    <th className="p-4">Product</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {store.products?.map((product) => (
                    <tr key={product.id} className="hover:bg-white/10 transition-colors">
                      <td className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-white/20 border border-white/20 overflow-hidden flex-shrink-0 relative">
                          {product.image ? (
                             <img src={product.image.replace("http://backend:8000", "http://localhost:8000")} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">📦</div>
                          )}
                        </div>
                        <span className="font-medium text-slate-900">{product.name}</span>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">{product.price} ETB</td>
                      <td className="p-4">
                        <span className={`badge ${product.stock > 0 ? 'bg-green-100/50 text-green-700' : 'bg-red-100/50 text-red-700'} backdrop-blur-sm`}>
                          {product.stock} units
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="btn-danger bg-red-50/50 hover:bg-red-100/50 backdrop-blur-sm"
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(!store.products || store.products.length === 0) && (
              <div className="p-12 text-center text-slate-500">
                <Package size={48} className="mx-auto mb-4 opacity-20" />
                <p>No products found. Start by adding one!</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
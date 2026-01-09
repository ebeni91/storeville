"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBaseUrl } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Store } from "../../types";

export default function Dashboard() {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // 1. Fetch Store
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
        setLoading(false);
        
        // 2. FETCH ORDERS (Once we know the user is valid)
        fetch(`${getBaseUrl()}/api/orders/`, {
          headers: { "Authorization": `Token ${token}` }
        })
        .then(res => res.json())
        .then(orderData => setOrders(orderData));
      }
    })
    .catch((err) => {
       // ... error handling ...
    });
  }, [isAuthenticated, token, router]);

  if (loading) return <div className="p-10">Loading...</div>;
  if (!store) return null; // Will redirect



// ... inside Dashboard component ...

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`${getBaseUrl()}/api/products/${productId}/`, {
        method: "DELETE",
        headers: {
          "Authorization": `Token ${token}`,
        },
      });

      if (res.ok) {
        // Remove from UI immediately without refreshing
        if (store) {
          setStore({
            ...store,
            products: store.products.filter((p) => p.id !== productId)
          });
        }
      } else {
        alert("Failed to delete product");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting product");
    }
  };




  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
             <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
             <p className="text-gray-500">Welcome back, {store.name}</p>
          </div>
          <div className="flex gap-3">
            <a href={`/store/${store.slug}`} target="_blank" className="bg-white border text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-50">
              View Live Store ↗
            </a>
            <a href="/dashboard/add-product" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700">
              + Add Product
            </a>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Total Products</h3>
            <p className="text-3xl font-bold">{store.products?.length || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Status</h3>
            <p className="text-3xl font-bold text-green-600">Active</p>
          </div>
           {/* You can add Order stats here later */}
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">My Inventory</h2>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Image</th>
                <th className="p-4 font-semibold text-gray-600">Name</th>
                <th className="p-4 font-semibold text-gray-600">Price</th>
                <th className="p-4 font-semibold text-gray-600">Stock</th>
                <th className="p-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {store.products?.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                      {product.image && (
                         <img 
                           src={product.image.replace("http://backend:8000", "http://localhost:8000")} 
                           className="w-full h-full object-cover" 
                         />
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-bold">{product.name}</td>
                  <td className="p-4 text-green-700">{product.price} ETB</td>
                  <td className="p-4">{product.stock} units</td>
                  <td className="p-4">
                    <button 
  onClick={() => handleDeleteProduct(product.id)}
  className="text-red-500 hover:text-red-700 text-sm font-bold"
>
  Delete
</button>
                  </td>
                </tr>
              ))}
              {(!store.products || store.products.length === 0) && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No products yet. Click "Add Product" to start!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* 👇 NEW: Orders Section */}
        <div className="mt-12 bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Incoming Orders</h2>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Order #</th>
                <th className="p-4 font-semibold text-gray-600">Customer</th>
                <th className="p-4 font-semibold text-gray-600">Items</th>
                <th className="p-4 font-semibold text-gray-600">Total</th>
                <th className="p-4 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="p-4 font-mono text-sm">#{order.id}</td>
                  <td className="p-4">
                    <div className="font-bold">{order.buyer_name}</div>
                    <div className="text-xs text-gray-500">{order.buyer_phone}</div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {order.items.map((item: any) => (
                      <div key={item.product_id}>
                         {item.quantity}x Product #{item.product_id}
                      </div>
                    ))}
                  </td>
                  <td className="p-4 font-bold text-green-700">
                    {order.total_amount} ETB
                  </td>
                  <td className="p-4">
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold uppercase">
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
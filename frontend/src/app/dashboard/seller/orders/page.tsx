'use client'

import { useState, useEffect } from 'react'
import { Search, Loader2, Eye, X, Package, Truck, CheckCircle, Clock } from 'lucide-react'
import { api } from '@/lib/api'

// Define the shape of our Order data
interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  price: string;
}

interface Order {
  id: string; // Could be UUID or string like "ORD-1234"
  customer_name: string;
  total_price: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  created_at: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isFetching, setIsFetching] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // Fetch orders from the Django backend
  const fetchOrders = async () => {
    try {
      // Adjust this endpoint if your Django urls.py uses something different!
      const res = await api.get('/orders/manage/') 
      const data = Array.isArray(res.data) ? res.data : res.data.results || []
      setOrders(data)
    } catch (err) {
      console.error("Failed to fetch orders", err)
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  // Update order status
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setIsUpdating(true)
    try {
      await api.patch(`/orders/manage/${orderId}/`, { status: newStatus })
      // Update local state so UI feels instant
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o))
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as any })
      }
    } catch (err) {
      alert("Failed to update status")
      console.error(err)
    } finally {
      setIsUpdating(false)
    }
  }

  // Helper to render beautiful status badges
  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'PENDING': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 flex items-center gap-1 w-max"><Clock size={12}/> Pending</span>
      case 'PROCESSING': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 flex items-center gap-1 w-max"><Package size={12}/> Processing</span>
      case 'SHIPPED': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 flex items-center gap-1 w-max"><Truck size={12}/> Shipped</span>
      case 'DELIVERED': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1 w-max"><CheckCircle size={12}/> Delivered</span>
      case 'CANCELLED': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 flex items-center gap-1 w-max"><X size={12}/> Cancelled</span>
      default: return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">{status}</span>
    }
  }

  return (
    <main className="p-8 relative h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Incoming Orders</h1>
          <p className="text-gray-500 font-medium mt-1">Manage and fulfill your customer purchases.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search by Order ID or Customer..." className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider font-bold">
              <th className="p-4">Order ID</th>
              <th className="p-4">Date</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isFetching ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500"><Loader2 className="animate-spin mx-auto mb-2" size={32} /> Loading orders...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500 font-medium">No orders yet. Keep marketing your store!</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-4 font-bold text-indigo-600">#{order.id.toString().slice(0,8).toUpperCase()}</td>
                  <td className="p-4 font-medium text-gray-600">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="p-4 font-bold text-gray-900">{order.customer_name}</td>
                  <td className="p-4 font-bold text-gray-700">Br {order.total_price}</td>
                  <td className="p-4"><StatusBadge status={order.status} /></td>
                  <td className="p-4 text-right">
                    <button onClick={() => setSelectedOrder(order)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors inline-flex items-center gap-2 text-sm font-bold">
                      <Eye size={18} /> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ORDER DETAILS DRAWER */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => setSelectedOrder(null)}></div>
          
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h2 className="text-xl font-black text-gray-900">Order #{selectedOrder.id.toString().slice(0,8).toUpperCase()}</h2>
                <p className="text-sm text-gray-500 font-medium">{new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Customer Details</h3>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="font-bold text-gray-900">{selectedOrder.customer_name}</p>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:border-indigo-100 transition-colors">
                      <div>
                        <p className="font-bold text-gray-900">{item.product_name}</p>
                        <p className="text-sm text-gray-500 font-medium">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-indigo-600">Br {item.price}</p>
                    </div>
                  ))}
                  {(!selectedOrder.items || selectedOrder.items.length === 0) && (
                    <p className="text-sm text-gray-500 italic">No items found for this order.</p>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center p-4 bg-indigo-50 text-indigo-900 rounded-xl border border-indigo-100">
                <span className="font-black text-lg">Total</span>
                <span className="font-black text-xl">Br {selectedOrder.total_price}</span>
              </div>
              
              {/* Update Status Controls */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Update Status</h3>
                <select 
                  className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-700 cursor-pointer"
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                  disabled={isUpdating}
                >
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
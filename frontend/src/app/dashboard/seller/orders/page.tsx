'use client'

import { useState, useEffect } from 'react'
import { Search, Loader2, Eye, X, Package, Truck, CheckCircle, Clock, MapPin, Phone, CreditCard, ChefHat, ShoppingBag } from 'lucide-react'
import { api } from '@/lib/api'

// Define the shape of our Super App Order data
interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: string;
}

interface Order {
  id: string; 
  customer_name: string;
  contact_phone: string;
  delivery_address: string;
  delivery_method: string;
  payment_method: string;
  total_amount: string;
  status: 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'ON_THE_WAY' | 'READY_FOR_PICKUP' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isFetching, setIsFetching] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/store-orders/') 
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

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setIsUpdating(true)
    try {
      await api.patch(`/orders/store-orders/${orderId}/`, { status: newStatus })
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

  const filteredOrders = orders.filter(o => 
    o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'PENDING': return <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-yellow-100 text-yellow-700 flex items-center gap-1.5 w-max"><Clock size={12}/> Pending</span>
      case 'ACCEPTED': return <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-blue-100 text-blue-700 flex items-center gap-1.5 w-max"><CheckCircle size={12}/> Accepted</span>
      case 'PREPARING': return <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-purple-100 text-purple-700 flex items-center gap-1.5 w-max"><ChefHat size={12}/> Preparing</span>
      case 'ON_THE_WAY': return <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-indigo-100 text-indigo-700 flex items-center gap-1.5 w-max"><Truck size={12}/> On the Way</span>
      case 'READY_FOR_PICKUP': return <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-orange-100 text-orange-700 flex items-center gap-1.5 w-max"><ShoppingBag size={12}/> Ready for Pickup</span>
      case 'COMPLETED': return <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-emerald-100 text-emerald-700 flex items-center gap-1.5 w-max"><CheckCircle size={12}/> Completed</span>
      case 'CANCELLED': return <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-red-100 text-red-700 flex items-center gap-1.5 w-max"><X size={12}/> Cancelled</span>
      default: return <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-gray-100 text-gray-700">{status}</span>
    }
  }

  // Helper to make delivery methods look nice
  const formatDeliveryMethod = (method: string) => {
    return method.replace(/_/g, ' ')
  }

  return (
    <main className="p-4 md:p-8 relative h-full max-w-[1600px] mx-auto flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Incoming Orders</h1>
          <p className="text-gray-500 font-medium mt-1 text-sm">Manage and fulfill your customer purchases.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by Order ID or Customer..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-black outline-none text-sm font-bold transition-all" 
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-400 text-[10px] uppercase tracking-widest font-black">
                <th className="p-5">Order ID</th>
                <th className="p-5">Date</th>
                <th className="p-5">Customer</th>
                <th className="p-5">Logistics</th>
                <th className="p-5">Total</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isFetching ? (
                <tr><td colSpan={7} className="p-12 text-center text-gray-500"><Loader2 className="animate-spin mx-auto mb-3" size={32} /> Loading orders...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={7} className="p-16 text-center text-gray-400 font-medium">No orders found. Keep marketing your store!</td></tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-5 font-black text-gray-900 text-sm">#{order.id.toString().slice(0,8).toUpperCase()}</td>
                    <td className="p-5 font-medium text-gray-500 text-xs">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="p-5">
                      <p className="font-bold text-gray-900 text-sm">{order.customer_name}</p>
                      <p className="font-medium text-gray-500 text-xs mt-0.5">{order.contact_phone}</p>
                    </td>
                    <td className="p-5">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest inline-block mb-1">
                        {formatDeliveryMethod(order.delivery_method)}
                      </span>
                    </td>
                    <td className="p-5 font-black text-gray-900">Br {order.total_amount}</td>
                    <td className="p-5"><StatusBadge status={order.status} /></td>
                    <td className="p-5 text-right">
                      <button onClick={() => setSelectedOrder(order)} className="p-2.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl transition-all inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                        <Eye size={16} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🚀 PREMIUM ORDER DETAILS DRAWER 🚀 */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedOrder(null)}></div>
          
          <div className="relative w-full sm:w-[500px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white z-10">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-gray-900">#{selectedOrder.id.toString().slice(0,8).toUpperCase()}</h2>
                <p className="text-xs text-gray-500 font-bold tracking-widest uppercase mt-1">{new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Status Manager */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Order Status</h3>
                <div className="relative">
                  <select 
                    className="w-full bg-white border border-gray-200 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-black outline-none font-black text-sm text-gray-900 cursor-pointer appearance-none shadow-sm"
                    value={selectedOrder.status}
                    onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                    disabled={isUpdating}
                  >
                    <option value="PENDING">Pending (Awaiting Confirmation)</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="PREPARING">Preparing / Packing</option>
                    <option value="ON_THE_WAY">Out for Delivery</option>
                    <option value="READY_FOR_PICKUP">Ready for Pickup</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  {isUpdating && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-gray-400" size={18} />}
                </div>
              </div>

              {/* Customer & Logistics */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Customer</h3>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 h-full">
                    <p className="font-black text-gray-900 text-sm mb-1">{selectedOrder.customer_name}</p>
                    <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5"><Phone size={12}/> {selectedOrder.contact_phone}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Logistics</h3>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 h-full">
                    <span className="bg-black text-white px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest inline-block mb-2">
                      {formatDeliveryMethod(selectedOrder.delivery_method)}
                    </span>
                    <p className="text-xs font-bold text-gray-500 flex items-start gap-1.5 leading-relaxed">
                      <MapPin size={14} className="shrink-0 mt-0.5"/> 
                      {selectedOrder.delivery_address || 'No address provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Payment</h3>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100">
                    <CreditCard size={18} className="text-gray-900"/>
                  </div>
                  <div>
                    <p className="font-black text-gray-900 text-sm">Via {selectedOrder.payment_method === 'COD' ? 'Cash on Delivery' : 'Telebirr'}</p>
                    <p className="text-xs font-bold text-gray-500">Collect upon delivery</p>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Purchased Items ({selectedOrder.items?.length || 0})</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 border border-gray-100 rounded-2xl bg-white shadow-sm">
                      <div>
                        <p className="font-black text-gray-900 text-sm mb-0.5 line-clamp-1">{item.product_name}</p>
                        <p className="text-xs text-gray-500 font-bold tracking-widest uppercase">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-black text-gray-900">Br {item.price}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Total Footer */}
            <div className="p-6 bg-gray-900 text-white rounded-t-[2rem] mt-auto relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
              <div className="flex justify-between items-center">
                <span className="font-black tracking-widest uppercase text-sm opacity-70">Total Amount</span>
                <span className="font-black text-2xl">Br {selectedOrder.total_amount}</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </main>
  )
}
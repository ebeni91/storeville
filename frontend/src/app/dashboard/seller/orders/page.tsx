'use client'

import { useState, useEffect } from 'react'
import { Search, Loader2, Eye, X, Package, Truck, CheckCircle, Clock, MapPin, Phone, CreditCard, ChefHat, ShoppingBag, FileText, Flame } from 'lucide-react'
import { api } from '@/lib/api'

export default function OrdersPage() {
  const [store, setStore] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [isFetching, setIsFetching] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchDashboardData = async () => {
    try {
      setIsFetching(true)
      
      // 1. Get Store Profile
      const storeRes = await api.get('/stores/manage/')
      const storeList = storeRes.data.results || storeRes.data || []
      const currentStore = storeList[0]

      if (!currentStore) {
        setIsFetching(false)
        return
      }
      setStore(currentStore)

      // 2. Fetch the correct orders based on engine
      const endpoint = currentStore.store_type === 'FOOD' ? '/orders/food/' : '/orders/retail/'
      const res = await api.get(endpoint)
      
      const data = Array.isArray(res.data) ? res.data : res.data.results || []
      setOrders(data)
    } catch (err) {
      console.error("Failed to fetch orders", err)
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setIsUpdating(true)
    try {
      const endpoint = store.store_type === 'FOOD' ? `/orders/food/${orderId}/` : `/orders/retail/${orderId}/`
      await api.patch(endpoint, { status: newStatus })
      
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus })
      }
    } catch (err) {
      alert("Failed to update status")
      console.error(err)
    } finally {
      setIsUpdating(false)
    }
  }

  const isFood = store?.store_type === 'FOOD'

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'PENDING': return <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-yellow-100 text-yellow-700 flex items-center gap-1.5 w-max"><Clock size={12}/> Pending</span>
      case 'ACCEPTED': return <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-blue-100 text-blue-700 flex items-center gap-1.5 w-max"><CheckCircle size={12}/> Accepted</span>
      case 'COOKING': return <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-orange-100 text-orange-700 flex items-center gap-1.5 w-max"><Flame size={12}/> In Kitchen</span>
      case 'PROCESSING': return <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-purple-100 text-purple-700 flex items-center gap-1.5 w-max"><Package size={12}/> Packing</span>
      case 'READY': return <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-indigo-100 text-indigo-700 flex items-center gap-1.5 w-max"><ShoppingBag size={12}/> Ready for Pickup</span>
      case 'SHIPPED': return <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-blue-100 text-blue-700 flex items-center gap-1.5 w-max"><Truck size={12}/> Shipped</span>
      case 'OUT_FOR_DELIVERY': return <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-indigo-100 text-indigo-700 flex items-center gap-1.5 w-max"><Truck size={12}/> On the Way</span>
      case 'DELIVERED': return <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-emerald-100 text-emerald-700 flex items-center gap-1.5 w-max"><CheckCircle size={12}/> Delivered</span>
      case 'CANCELLED': return <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-red-100 text-red-700 flex items-center gap-1.5 w-max"><X size={12}/> Cancelled</span>
      default: return <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-gray-100 text-gray-700">{status}</span>
    }
  }

  // Dynamic Statuses based on Engine
  const foodStatuses = ['PENDING', 'ACCEPTED', 'COOKING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']
  const retailStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
  const availableStatuses = isFood ? foodStatuses : retailStatuses

  return (
    <main className="p-4 md:p-8 relative h-full max-w-[1600px] mx-auto flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 flex items-center gap-3">
            {isFood ? <ChefHat size={32} className="text-orange-500"/> : <Package size={32} className="text-indigo-600"/>}
            {isFood ? 'Kitchen Orders' : 'Store Orders'}
          </h1>
          <p className="text-gray-500 font-medium mt-1 text-sm">Manage and fulfill your customer purchases.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by Order ID..." 
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
                <th className="p-5">Customer (ID)</th>
                <th className="p-5">Total</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isFetching ? (
                <tr><td colSpan={6} className="p-12 text-center text-gray-500"><Loader2 className="animate-spin mx-auto mb-3" size={32} /> Loading orders...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={6} className="p-16 text-center text-gray-400 font-medium">No orders found. Keep marketing your store!</td></tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-5 font-black text-gray-900 text-sm">
                      #{order.id.toString().slice(0,8).toUpperCase()}
                      {isFood && order.is_asap && <span className="ml-2 bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] uppercase">ASAP</span>}
                    </td>
                    <td className="p-5 font-medium text-gray-500 text-xs">
                      {new Date(order.created_at).toLocaleDateString()} <br/>
                      <span className="text-[10px]">{new Date(order.created_at).toLocaleTimeString()}</span>
                    </td>
                    <td className="p-5">
                      <p className="font-bold text-gray-900 text-sm">User #{order.customer}</p>
                    </td>
                    <td className="p-5 font-black text-gray-900">Br {parseFloat(order.total_amount).toFixed(2)}</td>
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
                <h2 className="text-2xl font-black tracking-tight text-gray-900">
                  #{selectedOrder.id.toString().slice(0,8).toUpperCase()}
                  {isFood && selectedOrder.is_asap && <span className="ml-3 bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] uppercase align-middle">ASAP</span>}
                </h2>
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
                    {availableStatuses.map(status => (
                      <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                  {isUpdating && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-gray-400" size={18} />}
                </div>
              </div>

              {/* Logistics */}
              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Location Details</h3>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 h-full">
                  <p className="text-sm font-bold text-gray-900 flex items-start gap-2 leading-relaxed">
                    <MapPin size={16} className="shrink-0 mt-0.5 text-indigo-500"/> 
                    {isFood ? selectedOrder.delivery_address : selectedOrder.shipping_address}
                  </p>
                  
                  {isFood && selectedOrder.delivery_instructions && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1 flex items-center gap-1"><FileText size={12}/> Instructions</p>
                      <p className="text-xs font-medium text-gray-600 italic">"{selectedOrder.delivery_instructions}"</p>
                    </div>
                  )}

                  {!isFood && selectedOrder.tracking_number && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Truck size={12}/> Tracking</p>
                      <p className="text-xs font-bold text-gray-900 font-mono">{selectedOrder.tracking_number}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Purchased Items ({selectedOrder.items?.length || 0})</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex flex-col p-4 border border-gray-100 rounded-2xl bg-white shadow-sm gap-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-black text-gray-900 text-sm mb-0.5">{isFood ? item.menu_item_name : item.product_name}</p>
                          <p className="text-xs text-gray-500 font-bold tracking-widest uppercase">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-black text-gray-900">Br {parseFloat(item.price_at_time).toFixed(2)}</p>
                      </div>
                      
                      {isFood && item.special_requests && (
                         <div className="mt-2 bg-orange-50 px-3 py-2 rounded-lg border border-orange-100">
                           <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-0.5">Kitchen Note:</p>
                           <p className="text-xs font-medium text-orange-800">"{item.special_requests}"</p>
                         </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Total Footer */}
            <div className="p-6 bg-gray-900 text-white rounded-t-[2rem] mt-auto relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-sm opacity-70">{isFood ? 'Delivery Fee' : 'Shipping Fee'}</span>
                <span className="font-bold text-sm opacity-70">Br {parseFloat(isFood ? selectedOrder.delivery_fee : selectedOrder.shipping_fee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-white/10">
                <span className="font-black tracking-widest uppercase text-sm">Total Amount</span>
                <span className="font-black text-2xl">Br {parseFloat(selectedOrder.total_amount).toFixed(2)}</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </main>
  )
}
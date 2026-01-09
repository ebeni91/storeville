"use client";

import { useEffect, useState } from "react";
import { getBaseUrl } from "../../lib/api";

interface Order {
  id: number;
  buyer_name: string;
  buyer_phone: string;
  total_amount: string;
  status: string;
  created_at: string;
  items: any[];
}

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // In a real app, we would get the logged-in user's store ID here.
  // For MVP, we will just fetch ALL orders (admin view).
  useEffect(() => {
    fetch(`${getBaseUrl()}/api/orders/`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  if (loading) return <div className="p-10">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Seller Dashboard</h1>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Total Orders</h3>
            <p className="text-3xl font-bold">{orders.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Total Revenue</h3>
            <p className="text-3xl font-bold">
              {orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0).toFixed(2)} ETB
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Pending Orders</h3>
            <p className="text-3xl font-bold">
              {orders.filter((o) => o.status === "pending").length}
            </p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Order ID</th>
                <th className="p-4 font-semibold text-gray-600">Customer</th>
                <th className="p-4 font-semibold text-gray-600">Total</th>
                <th className="p-4 font-semibold text-gray-600">Status</th>
                <th className="p-4 font-semibold text-gray-600">Date</th>
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
                  <td className="p-4 font-bold text-green-700">
                    {order.total_amount} ETB
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No orders found yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
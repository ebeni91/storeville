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
useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    fetch(`${getBaseUrl()}/api/stores/mine/`, {
      headers: { "Authorization": `Token ${token}` }
    })
      .then((res) => {
        // If 401/403, our token is bad. Log out.
        if (res.status === 401 || res.status === 403) {
          throw new Error("Unauthorized");
        }
        return res.json();
      })
      .then((data) => {
        // If data is null (no store yet), redirect to create
        if (!data || !data.id) {
          router.push("/create-store");
        } else {
          setStore(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (err.message === "Unauthorized") {
           // Optional: logout(); 
           router.push("/login");
        }
      });
  }, [isAuthenticated, token, router]);

  if (loading) return <div className="p-10">Loading...</div>;
  if (!store) return null; // Will redirect

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {store.name}
          </span>
        </div>

        {/* Placeholder for Stats (We will hook this up next) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Store Status</h3>
            <p className="text-2xl font-bold text-green-600">Active</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Products</h3>
            <p className="text-2xl font-bold">{store.products?.length || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
             <h3 className="text-gray-500 text-sm font-bold uppercase">Visit Store</h3>
             <a href={`/store/${store.slug}`} target="_blank" className="text-blue-600 underline mt-2 block">
               View Live Page &rarr;
             </a>
          </div>
        </div>
      </div>
    </div>
  );
}
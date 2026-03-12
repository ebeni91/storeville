import { ShoppingBag } from 'lucide-react'

// This page receives the subdomain string from the URL folder structure
export default function Storefront({ params }: { params: { subdomain: string } }) {
  // In a real app, we would fetch the store's products from Django here
  // using: await api.get(`/products/`, { headers: { Host: `${params.subdomain}.storeville.app` } })

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Store Header */}
      <header className="bg-white shadow-sm border-b pb-6 pt-12 px-8 text-center">
        <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold shadow-lg">
          {params.subdomain.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 capitalize">
          {params.subdomain.replace('-', ' ')}
        </h1>
        <p className="text-gray-500 mt-2">Official StoreVille Partner</p>
      </header>

      {/* Product Grid Placeholder */}
      <section className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800">
            <ShoppingBag size={20} />
            <span>Cart (0)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Mock Product Cards */}
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-shadow">
              <div className="bg-gray-200 w-full h-48 rounded-lg mb-4 animate-pulse"></div>
              <h3 className="font-bold text-lg">Product {item}</h3>
              <p className="text-gray-500 text-sm mb-4">Fresh local inventory</p>
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-primary">Br 450.00</span>
                <button className="bg-primary/10 text-primary px-3 py-1 rounded font-semibold hover:bg-primary hover:text-white transition-colors">
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
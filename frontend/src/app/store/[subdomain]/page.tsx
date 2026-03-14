import { ShoppingBag, Store as StoreIcon } from 'lucide-react'
import { api } from '@/lib/api'

// Define our TypeScript interface for the Django Product model
interface Product {
  id: string
  name: string
  description: string
  price: string
  stock_quantity: number
  is_active: boolean
}

// This function runs securely on the Next.js server
async function fetchStoreProducts(subdomain: string): Promise<Product[]> {
  try {
    // We hit the Django backend and spoof the Host header so our 
    // SubdomainStoreMiddleware automatically filters the products!
    const response = await api.get('/products/', {
      headers: {
        'Host': `${subdomain}.storeville.app` 
      }
    })
    
    // Django REST Framework uses pagination by default, so data is inside .results
    return response.data.results || response.data
  } catch (error) {
    console.error(`Failed to fetch products for ${subdomain}:`, error)
    return []
  }
}

export default async function Storefront({ params }: { params: { subdomain: string } }) {
  // Fetch the real products from PostgreSQL via Django
  const products = await fetchStoreProducts(params.subdomain)

  // Format the store name beautifully (e.g., "abel-electronics" -> "Abel Electronics")
  const storeName = params.subdomain
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Store Header */}
      <header className="bg-white shadow-sm border-b pb-6 pt-12 px-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-primary/10"></div>
        <div className="relative z-10">
          <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold shadow-lg border-4 border-white">
            {params.subdomain.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900">{storeName}</h1>
          <p className="text-gray-500 mt-2 font-medium flex items-center justify-center gap-2">
            <StoreIcon size={16} /> Official StoreVille Partner
          </p>
        </div>
      </header>

      {/* Product Grid */}
      <section className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Available Products</h2>
          <button className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-full font-medium hover:bg-gray-800 shadow-md transition-all">
            <ShoppingBag size={20} />
            <span>Cart (0)</span>
          </button>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <StoreIcon size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-600">No products found</h3>
            <p className="text-gray-400 mt-2">This store hasn't added any inventory yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-lg transition-all flex flex-col h-full group">
                {/* Image Placeholder */}
                <div className="bg-gray-100 w-full h-48 rounded-lg mb-4 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <span className="text-gray-400 font-medium text-sm">No Image</span>
                </div>
                
                <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{product.name}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">{product.description}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="font-extrabold text-xl text-primary">Br {parseFloat(product.price).toFixed(2)}</span>
                  <button 
                    disabled={!product.is_active || product.stock_quantity <= 0}
                    className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-bold hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
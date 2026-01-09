import { getBaseUrl } from "../../../lib/api";
import { Store } from "../../../types";
import AddToCartBtn from "../../../components/AddToCartBtn";

async function getStore(slug: string): Promise<Store | null> {
  const res = await fetch(`${getBaseUrl()}/api/stores/${slug}/`, {
    cache: "no-store",
  });
  if (!res.ok) return null; // Return null if 404
  return res.json();
}

// 👇 NEW HELPER FUNCTION
// This fixes the URL if Django sends "http://backend:8000..."
function getPublicImageUrl(url: string | null) {
  if (!url) return null;
  // If the URL contains "backend", swap it for "localhost"
  return url.replace("http://backend:8000", "http://localhost:8000");
}

export default async function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const store = await getStore(resolvedParams.slug);
  if (!store) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold text-gray-800">Store Not Found</h1>
        <p className="text-gray-500 mt-2">The store you are looking for does not exist.</p>
        <a href="/" className="text-blue-600 underline mt-4 block">Return Home</a>
      </div>
    );
  }
  return (
    <div>
      {/* Store Banner / Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{store.name}</h1>
        <p className="text-gray-500 capitalize">{store.category} Store</p>
      </div>

      {/* Product Grid */}
      <h2 className="text-2xl font-bold mb-6 border-b pb-2">Latest Products</h2>
      
      {store.products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-dashed">
          <p className="text-gray-500 text-lg">This store hasn't added any products yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {store.products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100 group">
              
              {/* Product Image Display */}
              <div className="h-48 bg-gray-200 overflow-hidden relative">
                {product.image ? (
                  <img 
                    // 👇 USE THE HELPER FUNCTION HERE
                    src={getPublicImageUrl(product.image) || ""} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-4xl">📦</span>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 truncate">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-lg font-bold text-green-700">
                    {product.price} ETB
                  </span>
                  <AddToCartBtn product={product} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
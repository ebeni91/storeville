import Link from "next/link";
import { fetchStores } from "../lib/api";
import { Store } from "../types";

export default async function Home() {
  let stores: Store[] = [];
  let debugError = ""; // New variable to hold the error

  try {
    stores = await fetchStores();
  } catch (e) {
    console.error("FETCH ERROR:", e);
    // Capture the error message to display it
    debugError = e instanceof Error ? e.message : "Unknown Error";
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Platform Header */}
      <header className="bg-white shadow-sm p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">StoreVille</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Open Your Store
          </button>
        </div>
      </header>





{/* DEBUG SECTION: Add this right after the Header */}
      {debugError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative container mx-auto mt-4">
          <strong className="font-bold">Connection Error: </strong>
          <span className="block sm:inline">{debugError}</span>
          <p className="text-sm mt-1">
            Trying to fetch from: <strong>http://backend:8000/api/stores/</strong>
          </p>
        </div>
      )}





      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-20 text-center">
        <h2 className="text-4xl font-bold mb-4">
          The Digital Mall of Ethiopia
        </h2>
        <p className="text-lg opacity-90">
          Shop from your favorite local creators and businesses.
        </p>
      </section>

      {/* Store Directory */}
      <main className="container mx-auto py-12 px-4">
        <h3 className="text-xl font-semibold mb-6">Browse Stores</h3>

        {stores.length === 0 ? (
          <p className="text-gray-500">
            No stores open yet. Be the first to join!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stores.map((store) => (
              <Link
                key={store.id}
                href={`/store/${store.slug}`}
                className="block group"
              >
                <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-6 border border-gray-100">
                  <div
                    className="h-32 rounded-md mb-4 flex items-center justify-center text-white font-bold text-2xl"
                    style={{
                      backgroundColor: store.primary_color || "#3b82f6",
                    }}
                  >
                    {store.name.substring(0, 2).toUpperCase()}
                  </div>
                  <h4 className="font-bold text-lg group-hover:text-blue-600">
                    {store.name}
                  </h4>
                  <p className="text-sm text-gray-500 capitalize">
                    {store.category}
                  </p>
                  <div className="mt-4 text-sm text-gray-400">
                    {store.products.length} Products
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
import { notFound } from "next/navigation";
import { getBaseUrl } from "../../../lib/api";
import { Store } from "../../../types";
import { CartProvider } from "../../../context/CartContext"; // Import Provider
import StoreNavbar from "../../../components/StoreNavbar";     // Import Navbar

// ... (keep fetchStore and getStore function as is) ...
async function getStore(slug: string): Promise<Store | null> {
  const res = await fetch(`${getBaseUrl()}/api/stores/${slug}/`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const store = await getStore(resolvedParams.slug);

  if (!store) {
    notFound();
  }

  return (
    <CartProvider> {/* <--- WRAP EVERYTHING */}
      <div className="min-h-screen bg-gray-50 font-sans">
        
        {/* Replace the old <nav> block with this: */}
        <StoreNavbar store={store} />

        <main className="container mx-auto px-4 py-8">
          {children}
        </main>

        <footer className="border-t mt-12 py-8 text-center text-gray-500 bg-white">
          <p>© {new Date().getFullYear()} {store.name}. Powered by StoreVille.</p>
        </footer>
      </div>
    </CartProvider>
  );
}
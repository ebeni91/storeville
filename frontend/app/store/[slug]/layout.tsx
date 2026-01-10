import { notFound } from "next/navigation";
import { getBaseUrl } from "../../../lib/api";
import { Store } from "../../../types";
import { CartProvider } from "../../../context/CartContext";
import StoreNavbar from "../../../components/StoreNavbar";

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
    <CartProvider>
      <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
        
        {/* 👇 FIX: Pass specific props (storeName & slug) instead of the object */}
        <StoreNavbar storeName={store.name} slug={store.slug} />

        {/* Removed 'container' classes so the Hero Banner can be full-width */}
        <main className="flex-1">
          {children}
        </main>

        <footer className="border-t border-slate-200 py-8 text-center text-slate-500 bg-white">
          <p>© {new Date().getFullYear()} {store.name}. Powered by StoreVille.</p>
        </footer>
      </div>
    </CartProvider>
  );
}
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
      {/* 👇 REMOVED 'bg-slate-50' so the global animated background shows through */}
      <div className="min-h-screen font-sans flex flex-col relative">
        
        <StoreNavbar storeName={store.name} slug={store.slug} />

        <main className="flex-1">
          {children}
        </main>

        {/* Footer: Glass effect instead of solid white */}
        <footer className="border-t border-white/20 py-8 text-center text-slate-500 bg-white/10 backdrop-blur-md">
          <p>© {new Date().getFullYear()} {store.name}. Powered by ShopVille.</p>
        </footer>
      </div>
    </CartProvider>
  );
}
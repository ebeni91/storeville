import MapExplorer from '@/components/MapExplorer'

export default function Home() {
  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-primary mb-2">StoreVille</h1>
        <p className="text-lg text-gray-600">Discover hyper-local stores delivering to you right now.</p>
      </header>

      <section>
        <MapExplorer />
      </section>
    </main>
  )
}
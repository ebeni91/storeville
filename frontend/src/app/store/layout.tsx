import '@/app/globals.css'

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full min-h-screen">
      {children}
    </div>
  )
}
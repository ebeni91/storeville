import './globals.css'
import type { Metadata } from 'next'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'StoreVille | Hyper-Local Marketplace',
  description: 'Discover nearby stores and order instantly.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 antialiased text-gray-900">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
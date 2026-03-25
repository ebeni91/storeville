import './globals.css'
import type { Metadata } from 'next'
import Providers from './providers'
import AuthProvider from '@/components/AuthProvider'

export const metadata: Metadata = {
  title: 'StoreVille | Hyper-Local Marketplace',
  description: 'Discover nearby stores and order instantly.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}
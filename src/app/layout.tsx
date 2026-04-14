import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/providers/QueryProvider'
import { AuthProvider } from '@/providers/AuthProvider'
import { CelebrationProvider } from '@/components/shared/Celebrations'
import { EasterEgg } from '@/components/shared/EasterEgg'
import { Toaster } from 'sonner'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'ByMik 🖤',
  description: 'Gestión de pedidos y productos para ByMik',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ByMik',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--background)]">
        <ErrorBoundary>
          <AuthProvider>
            <QueryProvider>
              {children}
              <CelebrationProvider />
              <EasterEgg />
              <Toaster
                position="top-center"
                toastOptions={{
                  style: {
                    background: '#fff',
                    border: '1px solid #e5e5e5',
                    color: '#0a0a0a',
                  },
                }}
              />
            </QueryProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ErrorBoundary from '@/components/ErrorBoundary'
import ErrorHandler from '@/components/ErrorHandler'
import { MiniAppProvider } from '@/components/MiniAppProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ride or Die Top 8 - Your Longest-Standing Farcaster Friends',
  description: 'Discover your ride or die friends on Farcaster with original engagement links and tip them!',
  other: {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://warpcast.com https://*.warpcast.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://warpcast.com https://*.warpcast.com https://api.neynar.com;",
    'fc:miniapp': 'Ride or Die Top 8',
    'fc:miniapp:domain': 'quicktop8-2u2d5py0o-chipagosfinests-projects.vercel.app',
    'fc:miniapp:icon': 'https://quicktop8-2u2d5py0o-chipagosfinests-projects.vercel.app/icon.png',
    'fc:miniapp:home': 'https://quicktop8-2u2d5py0o-chipagosfinests-projects.vercel.app'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      </head>
      <body className={inter.className}>
        <ErrorHandler />
        <ErrorBoundary>
          <MiniAppProvider>
            {children}
          </MiniAppProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}

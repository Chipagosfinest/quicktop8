import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ErrorBoundary from '@/components/ErrorBoundary'
import ErrorHandler from '@/components/ErrorHandler'
import { MiniAppProvider } from '@/components/MiniAppProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Crypto Streams - Your Top 8 Recommended Streamers',
  description: 'Discover your favorite crypto content creators on Farcaster and send them gifts!',
  other: {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://warpcast.com https://*.warpcast.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://warpcast.com https://*.warpcast.com https://api.neynar.com;",
    'fc:miniapp': JSON.stringify({
      "version": "1",
      "imageUrl": "https://quicktop8-ft26g4h9l-chipagosfinests-projects.vercel.app/og-image.png",
      "button": {
        "title": "🎮 Crypto Streams",
        "action": {
          "type": "launch_miniapp",
          "name": "Crypto Streams",
          "url": "https://quicktop8-ft26g4h9l-chipagosfinests-projects.vercel.app/app",
          "splashImageUrl": "https://quicktop8-ft26g4h9l-chipagosfinests-projects.vercel.app/splash.png",
          "splashBackgroundColor": "#8B5CF6"
        }
      }
    })
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

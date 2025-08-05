import type { Metadata } from 'next'
import './globals.css'
import ErrorBoundary from '@/components/ErrorBoundary'
import { MiniAppProvider } from '@/components/MiniAppProvider'

export const metadata: Metadata = {
  title: 'Friends of Friends - Your Top 8 Friends',
  description: 'Discover your closest friends based on mutual affinity scores',
  openGraph: {
    title: 'Friends of Friends - Your Top 8 Friends',
    description: 'Discover your closest friends based on mutual affinity scores',
    images: ['https://friends-of-friends.vercel.app/og-image.png'],
  },
  other: {
    'fc:miniapp': 'Friends of Friends',
    'fc:miniapp:domain': 'friends-of-friends.vercel.app',
    'fc:miniapp:icon': 'https://friends-of-friends.vercel.app/icon.png',
    'fc:miniapp:home': 'https://friends-of-friends.vercel.app/app',
    'fc:miniapp:image': 'https://friends-of-friends.vercel.app/og-image.png',
    'fc:miniapp:description': 'Discover your closest friends based on mutual affinity scores'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <MiniAppProvider>
            {children}
          </MiniAppProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}

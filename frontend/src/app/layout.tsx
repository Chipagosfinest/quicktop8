import type { Metadata } from 'next'
import './globals.css'
import ErrorBoundary from '@/components/ErrorBoundary'
import { MiniAppProvider } from '@/components/MiniAppProvider'

export const metadata: Metadata = {
  title: 'QuickTop8 - Your Top 8 Friends',
  description: 'Discover your closest friends based on mutual affinity scores',
  openGraph: {
    title: 'QuickTop8 - Your Top 8 Friends',
    description: 'Discover your closest friends based on mutual affinity scores',
    images: ['https://quicktop8-49qq8p5vc-chipagosfinests-projects.vercel.app/og-image.png'],
  },
  other: {
    'fc:miniapp': 'QuickTop8',
    'fc:miniapp:domain': 'quicktop8-49qq8p5vc-chipagosfinests-projects.vercel.app',
    'fc:miniapp:icon': 'https://quicktop8-49qq8p5vc-chipagosfinests-projects.vercel.app/icon.png',
    'fc:miniapp:home': 'https://quicktop8-49qq8p5vc-chipagosfinests-projects.vercel.app'
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

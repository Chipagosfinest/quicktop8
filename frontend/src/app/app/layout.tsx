import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'QuickTop8 - Your Digital Squad',
  description: 'Discover your closest friends based on mutual affinity scores. Relive the MySpace era with your most interactive Farcaster friends!',
  openGraph: {
    title: 'QuickTop8 - Your Digital Squad',
    description: 'Discover your closest friends based on mutual affinity scores. Relive the MySpace era with your most interactive Farcaster friends!',
    images: ['https://quicktop8-des6vnsnk-chipagosfinests-projects.vercel.app/og-image.png'],
    type: 'website',
    url: 'https://quicktop8-des6vnsnk-chipagosfinests-projects.vercel.app/app',
  },
  other: {
    'fc:miniapp': 'QuickTop8',
    'fc:miniapp:domain': 'quicktop8-des6vnsnk-chipagosfinests-projects.vercel.app',
    'fc:miniapp:icon': 'https://quicktop8-des6vnsnk-chipagosfinests-projects.vercel.app/icon.png',
    'fc:miniapp:home': 'https://quicktop8-des6vnsnk-chipagosfinests-projects.vercel.app'
  }
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 
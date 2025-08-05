import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Friends of Friends - Your Digital Squad',
  description: 'Discover your closest friends based on mutual affinity scores',
  openGraph: {
    title: 'Friends of Friends - Your Digital Squad',
    description: 'Discover your closest friends based on mutual affinity scores',
    images: ['https://friends-of-friends.vercel.app/og-image.png'],
    url: 'https://friends-of-friends.vercel.app/app',
  },
  other: {
    'fc:miniapp': 'Friends of Friends',
    'fc:miniapp:domain': 'friends-of-friends.vercel.app',
    'fc:miniapp:icon': 'https://friends-of-friends.vercel.app/icon.png',
    'fc:miniapp:home': 'https://friends-of-friends.vercel.app'
  }
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 
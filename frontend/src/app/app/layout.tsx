import type { Metadata } from 'next'

const miniappEmbed = {
  version: "1",
  imageUrl: "https://friends-of-friends.vercel.app/og-image.png",
  button: {
    title: "🤠 Find My Top 8",
    action: {
      type: "launch_miniapp",
      url: "https://friends-of-friends.vercel.app/app",
      name: "Friends of Friends",
      splashImageUrl: "https://friends-of-friends.vercel.app/splash.png",
      splashBackgroundColor: "#f7f7f7"
    }
  }
}

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
    'fc:miniapp': JSON.stringify(miniappEmbed),
    'fc:frame': JSON.stringify(miniappEmbed) // For backward compatibility
  }
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 
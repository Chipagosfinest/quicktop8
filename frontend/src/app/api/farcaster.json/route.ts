import { NextResponse } from 'next/server'

export async function GET() {
  const manifest = {
    miniapp: {
      version: "1",
      name: "Crypto Streams",
      iconUrl: "https://quicktop8-idzdrc205-chipagosfinests-projects.vercel.app/icon.png",
      homeUrl: "https://quicktop8-idzdrc205-chipagosfinests-projects.vercel.app/app",
      splashImageUrl: "https://quicktop8-idzdrc205-chipagosfinests-projects.vercel.app/splash.png",
      splashBackgroundColor: "#8B5CF6",
      subtitle: "Top 8 Recommended Streamers",
      description: "Discover your favorite crypto content creators on Farcaster and send them gifts!",
      primaryCategory: "social",
      tags: [
        "crypto",
        "streaming",
        "social",
        "gifting",
        "content"
      ],
      heroImageUrl: "https://quicktop8-idzdrc205-chipagosfinests-projects.vercel.app/og-image.png",
      tagline: "Your Top 8 Crypto Streamers",
      ogTitle: "Crypto Streams",
      ogDescription: "Discover your favorite crypto content creators on Farcaster and send them gifts!",
      ogImageUrl: "https://quicktop8-idzdrc205-chipagosfinests-projects.vercel.app/og-image.png",
      screenshotUrls: [
        "https://quicktop8-idzdrc205-chipagosfinests-projects.vercel.app/screenshot1.png",
        "https://quicktop8-idzdrc205-chipagosfinests-projects.vercel.app/screenshot2.png",
        "https://quicktop8-idzdrc205-chipagosfinests-projects.vercel.app/screenshot3.png"
      ]
    }
  }

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
} 
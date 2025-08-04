import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Get the current domain from the request
  const url = new URL(request.url)
  const baseUrl = `${url.protocol}//${url.host}`

  const manifest = {
    miniapp: {
      name: "Crypto Streams",
      version: "1",
      iconUrl: `${baseUrl}/icon.png`,
      homeUrl: `${baseUrl}/app`,
      imageUrl: `${baseUrl}/og-image.png`,
      buttonTitle: "Open Mini App",
      splashImageUrl: `${baseUrl}/splash.png`,
      splashBackgroundColor: "#8B5CF6",
      subtitle: "Top 8 Recommended Streamers",
      description: "Discover your favorite crypto content creators on Farcaster and send them gifts!",
      screenshotUrls: [
        `${baseUrl}/screenshot1.png`,
        `${baseUrl}/screenshot2.png`,
        `${baseUrl}/screenshot3.png`
      ],
      primaryCategory: "social",
      tags: [
        "crypto",
        "streaming",
        "social",
        "gifting",
        "content"
      ],
      heroImageUrl: `${baseUrl}/og-image.png`,
      tagline: "Your Top 8 Crypto Streamers",
      ogTitle: "Crypto Streams",
      ogDescription: "Discover your favorite crypto content creators on Farcaster and send them gifts!",
      ogImageUrl: `${baseUrl}/og-image.png`
    }
  }

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
} 
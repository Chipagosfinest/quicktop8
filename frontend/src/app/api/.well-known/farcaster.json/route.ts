import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Get the current domain from the request
  const url = new URL(request.url)
  const baseUrl = `${url.protocol}//${url.host}`

  const manifest = {
    miniapp: {
      name: "QuickTop8 - Wanted Friends",
      version: "1",
      iconUrl: `${baseUrl}/icon.png`,
      homeUrl: `${baseUrl}/app`,
      imageUrl: `${baseUrl}/og-image.png`,
      buttonTitle: "🤠 Wanted Friends",
      splashImageUrl: `${baseUrl}/splash.png`,
      splashBackgroundColor: "#8B4513",
      subtitle: "Your Most Wanted Farcaster Friends",
      description: "Discover your top 8 mutual follows with engagement history! Find the friends you want to keep around - your most wanted Farcaster companions.",
      screenshotUrls: [
        `${baseUrl}/screenshot1.png`,
        `${baseUrl}/screenshot2.png`,
        `${baseUrl}/screenshot3.png`
      ],
      primaryCategory: "social",
      tags: [
        "social",
        "friends",
        "analytics",
        "cowboy",
        "wanted",
        "top8",
        "engagement"
      ],
      heroImageUrl: `${baseUrl}/og-image.png`,
      tagline: "Your Most Wanted Farcaster Friends",
      ogTitle: "QuickTop8 - Your Most Wanted Farcaster Friends",
      ogDescription: "Discover your top 8 mutual follows with engagement history! Find the friends you want to keep around - your most wanted Farcaster companions.",
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
# QuickTop8 - Standardized URLs

## 🎯 Primary URLs for Mini App Registration

### Core URLs
- **Home URL**: `https://quicktop8-alpha.vercel.app/app`
- **Manifest URL**: `https://quicktop8-alpha.vercel.app/.well-known/farcaster.json`
- **Webhook URL**: `https://quicktop8-alpha.vercel.app/api/webhook`

### Assets
- **Icon URL**: `https://quicktop8-alpha.vercel.app/icon.png`
- **Image URL**: `https://quicktop8-alpha.vercel.app/og-image.png`
- **Splash Image URL**: `https://quicktop8-alpha.vercel.app/splash.png`

## 🧪 Testing URLs

### Development & Testing
- **Interactive App**: `https://quicktop8-alpha.vercel.app/app`
- **API Test**: `https://quicktop8-alpha.vercel.app/api/top8`
- **Preview Tool**: `https://farcaster.xyz/~/developers/mini-apps/preview?url=https%3A//quicktop8-alpha.vercel.app/app`

### Alternative Pages
- **Landing Page**: `https://quicktop8-alpha.vercel.app/`
- **Simple Test**: `https://quicktop8-alpha.vercel.app/simple`
- **Test Page**: `https://quicktop8-alpha.vercel.app/test`

## 📋 Mini App Configuration

### Farcaster Manifest
```json
{
  "miniapp": {
    "version": "1",
    "name": "QuickTop8",
    "description": "Discover your most interactive friends on Farcaster (last 45 days)",
    "homeUrl": "https://quicktop8-alpha.vercel.app/app",
    "iconUrl": "https://quicktop8-alpha.vercel.app/icon.png",
    "imageUrl": "https://quicktop8-alpha.vercel.app/og-image.png",
    "buttonTitle": "🎯 Discover",
    "splashImageUrl": "https://quicktop8-alpha.vercel.app/splash.png",
    "splashBackgroundColor": "#8B5CF6",
    "webhookUrl": "https://quicktop8-alpha.vercel.app/api/webhook"
  }
}
```

## 🔧 API Endpoints

### Core API
- **Top 8 Analysis**: `POST https://quicktop8-alpha.vercel.app/api/top8`
- **Frame Handler**: `GET/POST https://quicktop8-alpha.vercel.app/api/frame`
- **Webhook Handler**: `POST https://quicktop8-alpha.vercel.app/api/webhook`

## 📝 Usage Notes

- All URLs are production-ready and deployed on Vercel
- The app analyzes interactions from the last 45 days
- API includes proper error handling and timeouts
- Webhook is configured for Neynar notifications
- Manifest is optimized for Farcaster Mini App standards

## 🚀 Quick Start

1. **Test the API**: Use the API Test URL with a FID (e.g., 4044)
2. **Preview the App**: Use the Preview Tool URL in Farcaster
3. **Register Mini App**: Use the Manifest URL for Farcaster registration 
#!/usr/bin/env node

console.log('🚀 BULLETPROOF MANIFEST SOLUTION\n')

const manifestData = {
  // App Identity
  appIcon: 'https://quicktop8-alpha.vercel.app/icon.png',
  subtitle: 'Prayer',
  description: 'Prayer',
  primaryCategory: 'social',
  
  // Visuals
  screenshots: 'https://quicktop8-alpha.vercel.app/og-image.png',
  previewImage: 'https://quicktop8-alpha.vercel.app/og-image.png',
  heroImage: 'https://quicktop8-alpha.vercel.app/og-image.png',
  splashScreenImage: 'https://quicktop8-alpha.vercel.app/splash.png',
  splashBackgroundColor: '#6200EA',
  
  // Engagement
  searchTags: 'social',
  marketingTagline: 'Prayer',
  buttonTitle: 'Send',
  socialShareTitle: 'Prayer',
  socialShareDescription: 'Prayer',
  socialShareImage: 'https://quicktop8-alpha.vercel.app/og-image.png',
  castShareURL: 'https://warpcast.com/~/compose?text=Check+out+Prayer+app',
  
  // Technical
  homeURL: 'https://quicktop8-alpha.vercel.app',
  webhookURL: 'https://quicktop8-alpha.vercel.app/api/webhook'
}

console.log('📋 MANIFEST VALUES (Copy to Farcaster Developer Tools):\n')
Object.entries(manifestData).forEach(([key, value]) => {
  console.log(`${key}: ${value}`)
})

console.log('\n🎯 APPROACH 1: FRESH HOSTED MANIFEST (RECOMMENDED)')
console.log('1. Go to "Manage Hosted Manifests"')
console.log('2. Delete any existing manifests')
console.log('3. Create new embed link')
console.log('4. Use values above to populate form')
console.log('5. Sign the fresh manifest')
console.log('6. Copy the new hosted manifest URL')
console.log('7. Update vercel.json redirect to new URL')

console.log('\n🎯 APPROACH 2: LOCAL MANIFEST ONLY')
console.log('1. Go to Farcaster Developer Tools')
console.log('2. Enter: https://quicktop8-alpha.vercel.app/embed')
console.log('3. Click "Refetch"')
console.log('4. Import local manifest directly')
console.log('5. Use values above to update form')
console.log('6. Sign the manifest')

console.log('\n🎯 APPROACH 3: DIRECT IMPORT')
console.log('1. Go to Farcaster Developer Tools')
console.log('2. Click "Import Manifest"')
console.log('3. Paste this JSON:')
console.log(JSON.stringify({
  frame: {
    name: "Prayer Emoji",
    version: "1",
    iconUrl: "https://quicktop8-alpha.vercel.app/icon.png",
    homeUrl: "https://quicktop8-alpha.vercel.app",
    imageUrl: "https://quicktop8-alpha.vercel.app/og-image.png",
    buttonTitle: "Send Prayer",
    splashImageUrl: "https://quicktop8-alpha.vercel.app/splash.png",
    splashBackgroundColor: "#6200EA",
    webhookUrl: "https://quicktop8-alpha.vercel.app/api/webhook",
    subtitle: "Send Prayer Emoji NFTs",
    description: "Send prayer emoji NFTs to your biggest fans on Farcaster. Discover your Top Reply Guys and Inner Circle based on real engagement.",
    primaryCategory: "social",
    tags: ["social", "prayer", "community", "engagement", "fans"],
    ogTitle: "Prayer Emoji",
    ogDescription: "Send prayer emoji NFTs to your biggest fans on Farcaster",
    ogImageUrl: "https://quicktop8-alpha.vercel.app/og-image.png"
  }
}, null, 2))

console.log('\n🚨 TROUBLESHOOTING:')
console.log('- Clear browser cache completely')
console.log('- Try incognito/private mode')
console.log('- Check Farcaster account connection')
console.log('- Verify all URLs are accessible')
console.log('- Wait 2-3 minutes between attempts')

console.log('\n⚡ QUICK FIXES:')
console.log('- If signing fails: Make a small change to description')
console.log('- If import fails: Try different browser')
console.log('- If URL fails: Check network tab for errors')
console.log('- If manifest not found: Wait 5 minutes for CDN')

console.log('\n🎯 IMMEDIATE ACTION PLAN:')
console.log('1. Try Approach 1 (Fresh Hosted Manifest)')
console.log('2. If fails → Approach 2 (Local Manifest)')
console.log('3. If fails → Approach 3 (Direct Import)')
console.log('4. If all fail → Contact Farcaster support')

console.log('\n📞 EMERGENCY CONTACTS:')
console.log('- Farcaster Discord: #mini-apps')
console.log('- Farcaster Developer Tools support')
console.log('- Check Farcaster status page') 
#!/usr/bin/env node

console.log('🔧 Farcaster Manifest Fix Helper\n')

const manifestData = {
  // App Identity
  appIcon: 'https://quicktop8-alpha.vercel.app/icon.png',
  subtitle: 'Send Prayer Emoji NFTs',
  description: 'Send prayer emoji NFTs to your biggest fans on Farcaster. Discover your Top Reply Guys and Inner Circle based on real engagement.',
  primaryCategory: 'social',
  
  // Visuals
  screenshots: 'https://quicktop8-alpha.vercel.app/og-image.png',
  previewImage: 'https://quicktop8-alpha.vercel.app/og-image.png',
  heroImage: 'https://quicktop8-alpha.vercel.app/og-image.png',
  splashScreenImage: 'https://quicktop8-alpha.vercel.app/splash.png',
  splashBackgroundColor: '#6200EA',
  
  // Engagement
  searchTags: 'social,prayer,community,engagement,fans',
  marketingTagline: 'Send prayer emoji NFTs to your biggest fans',
  buttonTitle: 'Send Prayer',
  socialShareTitle: 'Prayer Emoji - Send Prayer NFTs',
  socialShareDescription: 'Send prayer emoji NFTs to your biggest fans on Farcaster',
  socialShareImage: 'https://quicktop8-alpha.vercel.app/og-image.png',
  castShareURL: 'https://warpcast.com/~/compose?text=Check+out+Prayer+Emoji+app',
  
  // Technical
  homeURL: 'https://quicktop8-alpha.vercel.app',
  webhookURL: 'https://quicktop8-alpha.vercel.app/api/webhook'
}

console.log('📋 Copy these values to your Farcaster Developer Tools:\n')

Object.entries(manifestData).forEach(([key, value]) => {
  console.log(`${key}: ${value}`)
})

console.log('\n🎯 Next Steps:')
console.log('1. Refresh Farcaster Developer Tools')
console.log('2. Enter: https://quicktop8-alpha.vercel.app/embed')
console.log('3. Click "Refetch"')
console.log('4. Update the form fields with values above')
console.log('5. Try signing again')

console.log('\n🚨 If signing still fails:')
console.log('- Make sure you have a Farcaster account connected')
console.log('- Try creating a new hosted manifest')
console.log('- Check that all URLs are accessible')
console.log('- Clear browser cache and try again') 
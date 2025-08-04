#!/usr/bin/env node

const fs = require('fs');

console.log('🔄 QUICK REDIRECT UPDATER\n')

console.log('📝 Usage: node update-redirect.js <hosted-manifest-url>')
console.log('Example: node update-redirect.js https://api.farcaster.xyz/miniapps/hosted-manifest/NEW-ID-HERE\n')

const hostedManifestUrl = process.argv[2];

if (!hostedManifestUrl) {
  console.log('❌ Please provide a hosted manifest URL as argument')
  console.log('Example: node update-redirect.js https://api.farcaster.xyz/miniapps/hosted-manifest/abc123')
  process.exit(1);
}

// Read current vercel.json
const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

// Update the redirect
vercelConfig.redirects = [
  {
    source: '/.well-known/farcaster.json',
    destination: hostedManifestUrl,
    permanent: false
  }
];

vercelConfig.headers = [
  {
    source: '/.well-known/farcaster.json',
    headers: [
      {
        key: 'Content-Type',
        value: 'application/json'
      },
      {
        key: 'Cache-Control',
        value: 'public, max-age=3600'
      }
    ]
  }
];

// Write updated vercel.json
fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));

console.log('✅ Updated vercel.json with new hosted manifest URL')
console.log(`📍 Redirect: /.well-known/farcaster.json → ${hostedManifestUrl}`)
console.log('\n🚀 Next steps:')
console.log('1. git add vercel.json')
console.log('2. git commit -m "Update hosted manifest redirect"')
console.log('3. git push origin main')
console.log('4. npx vercel --prod --yes')
console.log('\n⏰ Wait 2-3 minutes for deployment, then test Farcaster Embed Tool') 
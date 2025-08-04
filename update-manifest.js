#!/usr/bin/env node

// Farcaster Manifest Update Script
// This script helps update the Farcaster Developer Tools manifest fields

const manifestData = {
  // App Identity & Store Presence
  appName: "Reply Guy",
  appIcon: "https://quicktop8-alpha.vercel.app/icon.png",
  subtitle: "Reward Reply Guys",
  description: "Discover your biggest fans on Farcaster and show them appreciation with tips and NFTs. Find your Top Reply Guys and Inner Circle based on real engagement.",
  primaryCategory: "social",
  
  // Visuals & Branding
  screenshots: "https://quicktop8-alpha.vercel.app/og-image.png",
  previewImage: "https://quicktop8-alpha.vercel.app/og-image.png",
  heroImage: "https://quicktop8-alpha.vercel.app/og-image.png",
  splashImage: "https://quicktop8-alpha.vercel.app/splash.png",
  splashBackgroundColor: "#6200EA",
  
  // Engagement & Discovery
  searchTags: ["social", "reply", "community", "engagement", "fans"],
  marketingTagline: "Discover your biggest fans on Farcaster",
  buttonTitle: "Open mini app",
  socialShareTitle: "Reply Guy",
  socialShareDescription: "Discover your biggest fans on Farcaster and show them appreciation with tips and NFTs",
  socialShareImage: "https://quicktop8-alpha.vercel.app/og-image.png",
  castShareUrl: "https://warpcast.com/~/compose?text=Check out Reply Guy - discover your biggest fans!",
  
  // Technical Configuration
  homeUrl: "https://quicktop8-alpha.vercel.app",
  webhookUrl: "https://quicktop8-alpha.vercel.app/api/webhook",
  
  // Domain
  domain: "quicktop8-alpha.vercel.app"
};

console.log("🎯 Farcaster Manifest Update Helper");
console.log("=====================================\n");

console.log("📝 Copy these values into your Farcaster Developer Tools:\n");

console.log("🔧 App Identity & Store Presence:");
console.log(`   App Name: ${manifestData.appName}`);
console.log(`   App Icon: ${manifestData.appIcon}`);
console.log(`   Subtitle: ${manifestData.subtitle}`);
console.log(`   Description: ${manifestData.description}`);
console.log(`   Primary Category: ${manifestData.primaryCategory}\n`);

console.log("🎨 Visuals & Branding:");
console.log(`   Screenshots: ${manifestData.screenshots}`);
console.log(`   Preview Image: ${manifestData.previewImage}`);
console.log(`   Hero Image: ${manifestData.heroImage}`);
console.log(`   Splash Screen Image: ${manifestData.splashImage}`);
console.log(`   Splash Background Color: ${manifestData.splashBackgroundColor}\n`);

console.log("📢 Engagement & Discovery:");
console.log(`   Search Tags: ${manifestData.searchTags.join(", ")}`);
console.log(`   Marketing Tagline: ${manifestData.marketingTagline}`);
console.log(`   Button Title: ${manifestData.buttonTitle}`);
console.log(`   Social Share Title: ${manifestData.socialShareTitle}`);
console.log(`   Social Share Description: ${manifestData.socialShareDescription}`);
console.log(`   Social Share Image: ${manifestData.socialShareImage}`);
console.log(`   Cast Share URL: ${manifestData.castShareUrl}\n`);

console.log("⚙️ Technical Configuration:");
console.log(`   Home URL: ${manifestData.homeUrl}`);
console.log(`   Webhook URL: ${manifestData.webhookUrl}\n`);

console.log("🌐 Domain:");
console.log(`   Domain: ${manifestData.domain}\n`);

// Generate JSON for clipboard
const jsonManifest = {
  frame: {
    name: manifestData.appName,
    version: "1",
    iconUrl: manifestData.appIcon,
    homeUrl: manifestData.homeUrl,
    imageUrl: manifestData.previewImage,
    buttonTitle: manifestData.buttonTitle,
    splashImageUrl: manifestData.splashImage,
    splashBackgroundColor: manifestData.splashBackgroundColor,
    webhookUrl: manifestData.webhookUrl,
    subtitle: manifestData.subtitle,
    description: manifestData.description,
    primaryCategory: manifestData.primaryCategory,
    tags: manifestData.searchTags,
    ogTitle: manifestData.socialShareTitle,
    ogDescription: manifestData.socialShareDescription,
    ogImageUrl: manifestData.socialShareImage
  }
};

console.log("📋 JSON Manifest (copy this to clipboard):");
console.log(JSON.stringify(jsonManifest, null, 2));

console.log("\n🚀 Next Steps:");
console.log("1. Go to Farcaster Developer Tools");
console.log("2. Update the Domain field to: quicktop8-alpha.vercel.app");
console.log("3. Copy and paste the values above into each field");
console.log("4. Click 'Update' to save changes");
console.log("5. Sign the manifest if prompted");
console.log("6. Test the Embed Tool with: https://quicktop8-alpha.vercel.app/embed");

// Browser automation hint
console.log("\n💡 Pro Tip: You can use browser developer tools to auto-fill:");
console.log("1. Open Farcaster Developer Tools in browser");
console.log("2. Open Developer Console (F12)");
console.log("3. Run this script in the console to auto-fill fields"); 
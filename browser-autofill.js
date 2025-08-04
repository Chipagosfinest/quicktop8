// Browser Automation Script for Farcaster Developer Tools
// Run this in the browser console on the Farcaster Developer Tools page

(function() {
  const manifestData = {
    appName: "Reply Guy",
    appIcon: "https://quicktop8-alpha.vercel.app/icon.png",
    subtitle: "Reward Reply Guys",
    description: "Discover your biggest fans on Farcaster and show them appreciation with tips and NFTs. Find your Top Reply Guys and Inner Circle based on real engagement.",
    primaryCategory: "social",
    screenshots: "https://quicktop8-alpha.vercel.app/og-image.png",
    previewImage: "https://quicktop8-alpha.vercel.app/og-image.png",
    heroImage: "https://quicktop8-alpha.vercel.app/og-image.png",
    splashImage: "https://quicktop8-alpha.vercel.app/splash.png",
    splashBackgroundColor: "#6200EA",
    searchTags: ["social", "reply", "community", "engagement", "fans"],
    marketingTagline: "Discover your biggest fans on Farcaster",
    buttonTitle: "Open mini app",
    socialShareTitle: "Reply Guy",
    socialShareDescription: "Discover your biggest fans on Farcaster and show them appreciation with tips and NFTs",
    socialShareImage: "https://quicktop8-alpha.vercel.app/og-image.png",
    castShareUrl: "https://warpcast.com/~/compose?text=Check out Reply Guy - discover your biggest fans!",
    homeUrl: "https://quicktop8-alpha.vercel.app",
    webhookUrl: "https://quicktop8-alpha.vercel.app/api/webhook",
    domain: "quicktop8-alpha.vercel.app"
  };

  console.log("🚀 Auto-filling Farcaster Developer Tools form...");

  // Helper function to find and fill input fields
  function fillInput(label, value) {
    const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
    const input = inputs.find(input => {
      const labelText = input.closest('label')?.textContent || 
                       input.previousElementSibling?.textContent ||
                       input.getAttribute('placeholder') ||
                       input.getAttribute('name') ||
                       '';
      return labelText.toLowerCase().includes(label.toLowerCase());
    });
    
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      console.log(`✅ Filled ${label}: ${value}`);
      return true;
    } else {
      console.log(`❌ Could not find field for: ${label}`);
      return false;
    }
  }

  // Fill all the fields
  const fields = [
    ['domain', manifestData.domain],
    ['app name', manifestData.appName],
    ['app icon', manifestData.appIcon],
    ['subtitle', manifestData.subtitle],
    ['description', manifestData.description],
    ['primary category', manifestData.primaryCategory],
    ['screenshots', manifestData.screenshots],
    ['preview image', manifestData.previewImage],
    ['hero image', manifestData.heroImage],
    ['splash screen image', manifestData.splashImage],
    ['splash background color', manifestData.splashBackgroundColor],
    ['marketing tagline', manifestData.marketingTagline],
    ['button title', manifestData.buttonTitle],
    ['social share title', manifestData.socialShareTitle],
    ['social share description', manifestData.socialShareDescription],
    ['social share image', manifestData.socialShareImage],
    ['cast share url', manifestData.castShareUrl],
    ['home url', manifestData.homeUrl],
    ['webhook url', manifestData.webhookUrl]
  ];

  let successCount = 0;
  fields.forEach(([label, value]) => {
    if (fillInput(label, value)) successCount++;
  });

  console.log(`\n🎉 Auto-fill complete! Successfully filled ${successCount}/${fields.length} fields.`);
  console.log("📝 Manual steps remaining:");
  console.log("1. Add search tags: social, reply, community, engagement, fans");
  console.log("2. Click 'Update' to save changes");
  console.log("3. Sign the manifest if prompted");

  // Try to add tags
  const tagInput = document.querySelector('input[placeholder*="tag"], input[name*="tag"]');
  if (tagInput) {
    manifestData.searchTags.forEach(tag => {
      tagInput.value = tag;
      tagInput.dispatchEvent(new Event('input', { bubbles: true }));
      tagInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });
    console.log("✅ Added search tags");
  }

})(); 
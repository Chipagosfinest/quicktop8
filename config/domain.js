/**
 * QuickTop8 Domain Configuration
 * 
 * This file centralizes all domain and URL configurations
 * to ensure consistency across the entire project.
 */

const DOMAIN_CONFIG = {
  // Primary domain for all URLs
  PRIMARY_DOMAIN: 'quicktop8-alpha.vercel.app',
  
  // Protocol
  PROTOCOL: 'https',
  
  // Base URL
  get BASE_URL() {
    return `${this.PROTOCOL}://${this.PRIMARY_DOMAIN}`;
  },
  
  // Core URLs
  get HOME_URL() {
    return `${this.BASE_URL}/app`;
  },
  
  get MANIFEST_URL() {
    return `${this.BASE_URL}/.well-known/farcaster.json`;
  },
  
  get WEBHOOK_URL() {
    return `${this.BASE_URL}/api/webhook`;
  },
  
  // Asset URLs
  get ICON_URL() {
    return `${this.BASE_URL}/icon.png`;
  },
  
  get IMAGE_URL() {
    return `${this.BASE_URL}/og-image.png`;
  },
  
  get SPLASH_IMAGE_URL() {
    return `${this.BASE_URL}/splash.png`;
  },
  
  // API URLs
  get API_BASE_URL() {
    return `${this.BASE_URL}/api`;
  },
  
  get TOP8_API_URL() {
    return `${this.API_BASE_URL}/top8`;
  },
  
  get FRAME_API_URL() {
    return `${this.API_BASE_URL}/frame`;
  },
  
  get HEALTH_API_URL() {
    return `${this.BASE_URL}/health`;
  },
  
  // Testing URLs
  get LANDING_PAGE_URL() {
    return `${this.BASE_URL}/`;
  },
  
  get SIMPLE_TEST_URL() {
    return `${this.BASE_URL}/simple`;
  },
  
  get TEST_PAGE_URL() {
    return `${this.BASE_URL}/test`;
  },
  
  get PREVIEW_TOOL_URL() {
    return `https://farcaster.xyz/~/developers/mini-apps/preview?url=${encodeURIComponent(this.HOME_URL)}`;
  },
  
  // Farcaster Mini App Configuration
  get FARCASTER_CONFIG() {
    return {
      version: "1",
      name: "QuickTop8",
      description: "Discover your most interactive friends on Farcaster (last 45 days)",
      homeUrl: this.HOME_URL,
      iconUrl: this.ICON_URL,
      imageUrl: this.IMAGE_URL,
      buttonTitle: "🎯 Discover",
      splashImageUrl: this.SPLASH_IMAGE_URL,
      splashBackgroundColor: "#8B5CF6",
      webhookUrl: this.WEBHOOK_URL
    };
  },
  
  // Environment variables
  get ENV_VARS() {
    return {
      CORS_ORIGIN: this.BASE_URL,
      BACKEND_URL: this.BASE_URL,
      FRONTEND_URL: this.BASE_URL
    };
  }
};

// Export for use in other files
module.exports = DOMAIN_CONFIG;

// Also export individual values for convenience
module.exports.PRIMARY_DOMAIN = DOMAIN_CONFIG.PRIMARY_DOMAIN;
module.exports.BASE_URL = DOMAIN_CONFIG.BASE_URL;
module.exports.HOME_URL = DOMAIN_CONFIG.HOME_URL;
module.exports.MANIFEST_URL = DOMAIN_CONFIG.MANIFEST_URL;
module.exports.WEBHOOK_URL = DOMAIN_CONFIG.WEBHOOK_URL;
module.exports.ICON_URL = DOMAIN_CONFIG.ICON_URL;
module.exports.IMAGE_URL = DOMAIN_CONFIG.IMAGE_URL;
module.exports.SPLASH_IMAGE_URL = DOMAIN_CONFIG.SPLASH_IMAGE_URL;
module.exports.TOP8_API_URL = DOMAIN_CONFIG.TOP8_API_URL;
module.exports.FRAME_API_URL = DOMAIN_CONFIG.FRAME_API_URL;
module.exports.HEALTH_API_URL = DOMAIN_CONFIG.HEALTH_API_URL;
module.exports.LANDING_PAGE_URL = DOMAIN_CONFIG.LANDING_PAGE_URL;
module.exports.SIMPLE_TEST_URL = DOMAIN_CONFIG.SIMPLE_TEST_URL;
module.exports.TEST_PAGE_URL = DOMAIN_CONFIG.TEST_PAGE_URL;
module.exports.PREVIEW_TOOL_URL = DOMAIN_CONFIG.PREVIEW_TOOL_URL;
module.exports.FARCASTER_CONFIG = DOMAIN_CONFIG.FARCASTER_CONFIG;
module.exports.ENV_VARS = DOMAIN_CONFIG.ENV_VARS; 
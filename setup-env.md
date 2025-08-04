# Environment Variables Setup Guide

## 🚀 Quick Setup for Railway (Backend)

1. Go to your Railway project: https://railway.com/project/d1a9a88f-8bad-45fd-b338-a4a81ea2fe6b
2. Click on "Variables" tab
3. Add these variables:

```
NEYNAR_API_KEY=1E58A226-A64C-4CF3-A047-FBED94F36101
NEYNAR_CLIENT_ID=b196e811-4d4a-4adb-bb5a-eb07dbd7765e
NEYNAR_WEBHOOK_SECRET=UuMoOuzbWbXgu00uRWsk3-cOS
CORS_ORIGIN=https://quicktop8-alpha.vercel.app
```

## 🚀 Quick Setup for Vercel (Frontend)

1. Go to your Vercel project: https://vercel.com/chipagosfinests-projects/quicktop8_
2. Click on "Settings" tab
3. Click on "Environment Variables"
4. Add these variables:

```
BACKEND_URL=https://top8-production.up.railway.app
NEYNAR_WEBHOOK_SECRET=UuMoOuzbWbXgu00uRWsk3-cOS
```

## 🔗 Neynar Webhook Configuration

Your webhook is already configured in Neynar:
- **Name**: `top8`
- **Target URL**: `https://quicktop8-alpha.vercel.app/api/webhook`
- **Webhook ID**: `01K1SVRE2BN1SD30Q6RPG3X719`
- **Secret**: `UuMoOuzbWbXgu00uRWsk3-cOS`

## ✅ Mini App Domain Ownership Verification

**IMPORTANT**: To complete your Mini App setup, you need to verify domain ownership:

1. **Deploy your app** to `https://quicktop8-alpha.vercel.app`
2. **Go to the Farcaster Manifest Tool**: https://farcaster.xyz/~/developers/mini-apps/manifest
3. **Enter your domain**: `quicktop8-alpha.vercel.app`
4. **Click "Claim Ownership"** and follow the steps to sign with your Farcaster custody address
5. **Copy the signed manifest** and update your `farcaster.json` file

The signed manifest should include both the `miniapp` and `accountAssociation` sections.

## 🔄 Recent Updates Made

✅ **Updated to Mini Apps (formerly Frames v2)**:
- Updated `farcaster.json` manifest with correct URLs
- Changed meta tags from `fc:frame` to `fc:miniapp`
- Removed deprecated `/api/frame` endpoint
- Created `MiniAppProvider` component for better SDK integration
- Updated app to use the official Farcaster Mini App SDK

✅ **Domain Configuration**:
- All URLs now point to `quicktop8-alpha.vercel.app`
- Manifest properly configured for Mini Apps
- Meta tags updated for Mini App discovery

✅ **API Improvements**:
- Added better error handling and logging
- Added fallback to popular casts endpoint
- Added API connectivity test endpoint
- Enhanced debugging information

✅ **Splash Screen Fix**:
- **Fixed**: `sdk.actions.ready()` now called at the right time
- **Fixed**: Added proper Mini App detection
- **Fixed**: Multiple `ready()` calls to ensure splash screen is hidden
- **Added**: Visual indicators for Mini App environment
- **Added**: Enhanced logging for debugging

## 🧪 Testing & Troubleshooting

### API Connectivity Test
After deployment, test the API connectivity:
```
https://quicktop8-alpha.vercel.app/api/test
```

This will verify:
- Environment variables are loaded correctly
- API key is working
- Neynar API connectivity

### Splash Screen Issues
**If the splash screen persists**:
- ✅ **Fixed**: `sdk.actions.ready()` is now called properly
- ✅ **Fixed**: Added multiple fallback calls to ensure ready() is called
- ✅ **Fixed**: Added proper timing to call ready() after content loads

**To verify it's working**:
1. Check browser console for "sdk.actions.ready() completed" messages
2. Look for "🚀 Running in Mini App" badge on the app page
3. The splash screen should disappear and show your app content

### Common Issues & Solutions

**404 Errors on `/api/top8`**:
- ✅ **Fixed**: Added fallback to popular casts endpoint
- ✅ **Fixed**: Enhanced error logging for debugging
- ✅ **Fixed**: Added API key validation

**Environment Variables Not Loading**:
- Check Vercel environment variables are set correctly
- Ensure variable names match exactly (case-sensitive)
- Redeploy after adding environment variables

**API Rate Limiting**:
- The app now includes proper error handling for rate limits
- Added delays between API calls to avoid rate limiting

**Mini App Not Detected**:
- ✅ **Fixed**: Added proper Mini App environment detection
- ✅ **Fixed**: Added visual indicators for Mini App status
- ✅ **Fixed**: Enhanced SDK initialization timing

## ✅ After Adding Environment Variables

1. **Railway**: Will automatically redeploy
2. **Vercel**: Will automatically redeploy
3. **Test API connectivity**: Visit `/api/test` endpoint
4. **Complete domain ownership verification** (see above)
5. **Test**: Your Mini App should now work properly!

## 🧪 Testing Links

- **Mini App**: https://quicktop8-alpha.vercel.app
- **API Test**: https://quicktop8-alpha.vercel.app/api/test
- **Webhook Test**: https://quicktop8-alpha.vercel.app/api/webhook
- **Manifest**: https://quicktop8-alpha.vercel.app/.well-known/farcaster.json
- **Preview Tool**: https://farcaster.xyz/~/developers/mini-apps/preview?url=https%3A//quicktop8-alpha.vercel.app
- **Manifest Tool**: https://farcaster.xyz/~/developers/mini-apps/manifest

## 📋 Next Steps

1. **Deploy the updated code** to Vercel
2. **Test API connectivity** using `/api/test` endpoint
3. **Verify domain ownership** using the Manifest Tool
4. **Test the Mini App** in the Farcaster client
5. **Monitor webhook events** for user interactions

## 🔧 Debugging

If you encounter issues:

1. **Check Vercel logs** for detailed error messages
2. **Test API connectivity** at `/api/test`
3. **Verify environment variables** are set correctly
4. **Check Farcaster client** for Mini App discovery issues
5. **Monitor webhook events** in Neynar dashboard
6. **Check browser console** for "sdk.actions.ready()" messages
7. **Look for Mini App badges** on the app page 
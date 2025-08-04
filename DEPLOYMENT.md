# QuickTop8 Deployment Guide

## 🚀 Deployment Status

### ✅ Frontend (Vercel) - DEPLOYED
- **URL**: https://quicktop8-alpha.vercel.app
- **Dashboard**: https://vercel.com/chipagosfinests-projects/quicktop8_/FawRkAQT9y7uZRXaKo9coCP9MMKE

### ✅ Backend (Vercel) - DEPLOYED
- **URL**: https://quicktop8-alpha.vercel.app
- **Dashboard**: https://vercel.com/chipagosfinests-projects/quicktop8_/FdK3pVctuAGTtnM2Lxe91LXrbe9t

## 🔧 Environment Variables

### Vercel Backend Variables
Add these to your Vercel backend project:
- `NEYNAR_API_KEY` = `1E58A226-A64C-4CF3-A047-FBED94F36101`
- `NEYNAR_CLIENT_ID` = `b196e811-4d4a-4adb-bb5a-eb07dbd7765e`
- `NEYNAR_WEBHOOK_SECRET` = `UuMoOuzbWbXgu00uRWsk3-cOS`
- `CORS_ORIGIN` = `https://quicktop8-alpha.vercel.app`

### Vercel Frontend Variables
Add these to your Vercel frontend project:
- `BACKEND_URL` = `https://quicktop8-alpha.vercel.app`
- `NEYNAR_WEBHOOK_SECRET` = `UuMoOuzbWbXgu00uRWsk3-cOS`

### Standardized URLs
- **Production URL**: `https://quicktop8-alpha.vercel.app`
- **App URL**: `https://quicktop8-alpha.vercel.app/app`
- **Manifest URL**: `https://quicktop8-alpha.vercel.app/.well-known/farcaster.json`
- **API URL**: `https://quicktop8-alpha.vercel.app/api/top8`
- **Webhook URL**: `https://quicktop8-alpha.vercel.app/api/webhook`

## 🔗 API Endpoints

### Backend (Vercel)
- `GET /health` - Health check
- `GET /api/user/:fid` - Get user info
- `GET /api/user/:fid/followers` - Get followers
- `GET /api/user/:fid/following` - Get following
- `GET /api/user/:fid/casts` - Get user casts
- `GET /api/search/users` - Search users
- `GET /api/trending/casts` - Get trending casts

### Frontend (Vercel)
- `POST /api/top8` - Analyze Top 8 friends
- `GET /api/frame` - Frame API for embeds

## 🧪 Testing

1. **Test Backend Health**: https://quicktop8-alpha.vercel.app/health
2. **Test Frontend**: https://quicktop8-alpha.vercel.app
3. **Test Manifest**: https://quicktop8-alpha.vercel.app/.well-known/farcaster.json

## 📝 Manual Deployment Commands

### Frontend (Vercel)
```bash
cd frontend
npx vercel --prod
```

### Backend (Vercel)
```bash
npx vercel --prod
```

## 🔄 Updates
- Both frontend and backend now deployed on Vercel
- CORS configured for cross-origin requests
- Environment variables properly configured
- Using Vercel for consistent deployment
- MCP integration included in deployment 
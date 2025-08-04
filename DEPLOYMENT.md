# QuickTop8 Deployment Guide

## 🚀 Deployment Status

### ✅ Frontend (Vercel) - DEPLOYED
- **North Star URL**: https://quicktop8-alpha.vercel.app
- **Dashboard**: https://vercel.com/chipagosfinests-projects/quicktop8_/A5JswiQ3aLp5gRk4DH5UgQc4r2rz

### ✅ Backend (Railway) - DEPLOYED
- **URL**: https://top8-production.up.railway.app
- **Dashboard**: https://railway.com/project/d1a9a88f-8bad-45fd-b338-a4a81ea2fe6b

## 🔧 Environment Variables

### Railway Backend Variables
Add these to your Railway project:
- `NEYNAR_API_KEY` = `1E58A226-A64C-4CF3-A047-FBED94F36101`
- `NEYNAR_CLIENT_ID` = `b196e811-4d4a-4adb-bb5a-eb07dbd7765e`
- `CORS_ORIGIN` = `https://quicktop8-alpha.vercel.app`

### Vercel Frontend Variables
Add these to your Vercel project:
- `BACKEND_URL` = `https://top8-production.up.railway.app`

## 🔗 API Endpoints

### Backend (Railway)
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

1. **Test Backend Health**: https://top8-production.up.railway.app/health
2. **Test Frontend**: https://quicktop8-alpha.vercel.app
3. **Test Manifest**: https://quicktop8-alpha.vercel.app/.well-known/farcaster.json

## 📝 Manual Deployment Commands

### Frontend (Vercel)
```bash
cd frontend
npx vercel --prod
```

### Backend (Railway)
```bash
npx @railway/cli up
```

## 🔄 Updates
- Frontend now calls Railway backend instead of Neynar directly
- CORS configured for cross-origin requests
- Environment variables properly configured
- Using `quicktop8-alpha.vercel.app` as north star domain 
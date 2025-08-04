# QuickTop8 Deployment Guide

## Frontend (Vercel) ✅ DEPLOYED
- **URL**: https://quicktop8-2jgigm313-chipagosfinests-projects.vercel.app
- **Dashboard**: https://vercel.com/chipagosfinests-projects/quicktop8_/AMHXqQqa1ZVYNLUPPDeUEmBeMP3X

## Backend Deployment Options

### Option 1: Render.com (Recommended - Free)
1. Go to [Render.com](https://render.com)
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository: `Chipagosfinest/quicktop8`
5. Configure:
   - **Name**: `quicktop8-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: Leave empty (deploy from root)
6. Add environment variables from `env.example`
7. Deploy!

### Option 2: Railway (Paid)
1. Go to [Railway.app](https://railway.app)
2. Sign up/Login with GitHub
3. Create new project from GitHub repo
4. Add environment variables
5. Deploy

### Option 3: Heroku (Paid)
1. Go to [Heroku.com](https://heroku.com)
2. Create new app
3. Connect GitHub repository
4. Add environment variables
5. Deploy

## Environment Variables
Copy from `env.example` and configure:
- `NEYNAR_API_KEY` - Your Neynar API key
- `PORT` - Server port (default: 3001)

## Manual Deployment Commands

### Frontend (Vercel)
```bash
cd frontend
npx vercel --prod
```

### Backend (Render)
```bash
# Deploy via Render dashboard or CLI
npx @render/cli deploy
```

## GitHub Actions (Optional)
Set up automatic deployment on push to main branch. 
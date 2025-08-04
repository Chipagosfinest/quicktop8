# QuickTop8 Deployment Guide

## 🚨 **Current Issue**

Your frontend is deployed on Vercel but trying to connect to a local backend, causing 500 errors. This guide will help you deploy the backend to fix the connection issues.

## 🎯 **Solution Overview**

1. **Deploy Backend to Vercel** - Create a separate backend deployment
2. **Update Frontend Configuration** - Point to the deployed backend
3. **Test the Connection** - Verify everything works in production

## 📋 **Step 1: Deploy Backend to Vercel**

### Option A: Deploy via Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Login to Vercel
vercel login

# Deploy the backend
vercel --prod

# Set environment variables
vercel env add NEYNAR_API_KEY
# Enter your Neynar API key when prompted
```

### Option B: Deploy via GitHub

1. **Create a new repository for the backend**
   ```bash
   # Create a new directory for backend
   mkdir quicktop8-backend
   cd quicktop8-backend
   
   # Copy backend files
   cp ../quicktop8/server-enhanced.js .
   cp ../quicktop8/neynar-indexer.js .
   cp ../quicktop8/package.json .
   cp ../quicktop8/vercel-backend.json ./vercel.json
   ```

2. **Create a new GitHub repository**
   - Go to GitHub and create a new repository called `quicktop8-backend`
   - Push the backend files to this repository

3. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import the `quicktop8-backend` repository
   - Add environment variable `NEYNAR_API_KEY` with your API key
   - Deploy

## 🔧 **Step 2: Update Frontend Configuration**

### Update Environment Variables

In your frontend Vercel deployment, add these environment variables:

```bash
# Go to your frontend project on Vercel
# Settings > Environment Variables

BACKEND_URL=https://your-backend-url.vercel.app
NEYNAR_API_KEY=your_neynar_api_key_here
NODE_ENV=production
```

### Update Frontend Code (if needed)

The frontend code has been updated to handle production vs development environments. If you need to manually update the backend URL:

```typescript
// In frontend/src/app/api/user/route.ts
const BACKEND_URL = process.env.BACKEND_URL || 'https://your-backend-url.vercel.app';
```

## 🧪 **Step 3: Test the Deployment**

### Test Backend Deployment

```bash
# Test the deployed backend
curl https://your-backend-url.vercel.app/health

# Test user data
curl https://your-backend-url.vercel.app/api/user/4044

# Test top interactions
curl "https://your-backend-url.vercel.app/api/user/4044/top-interactions?limit=8"
```

### Test Frontend Deployment

1. **Visit your frontend URL**
2. **Check the browser console** for any errors
3. **Verify the API calls** are going to the correct backend URL

## 🔍 **Step 4: Debugging**

### Common Issues

#### 1. **CORS Errors**
If you see CORS errors, update the backend CORS configuration:

```javascript
// In server-enhanced.js
app.use(cors({
  origin: [
    'https://quicktop8-alpha.vercel.app',
    'https://quicktop8.vercel.app',
    'https://your-frontend-url.vercel.app'
  ],
  credentials: true
}));
```

#### 2. **Environment Variables**
Make sure your backend has the correct environment variables:

```bash
# Required environment variables for backend
NEYNAR_API_KEY=your_api_key_here
NODE_ENV=production
```

#### 3. **API Key Issues**
Verify your Neynar API key is working:

```bash
# Test API key locally
curl -H "api_key: YOUR_API_KEY" \
  "https://api.neynar.com/v2/farcaster/user/bulk?fids=4044"
```

### Debugging Commands

```bash
# Test local backend
node server-enhanced.js

# Test local frontend
cd frontend && npm run dev

# Test connection
node test-frontend-connection.js

# Test performance
node test-performance.js
```

## 📊 **Step 5: Monitor Performance**

### Dashboard Access

Once deployed, you can access the performance dashboard:

```bash
# Local dashboard
http://localhost:4001

# Deployed dashboard (if you deploy it)
https://your-dashboard-url.vercel.app
```

### Health Checks

```bash
# Backend health
curl https://your-backend-url.vercel.app/health

# Performance stats
curl https://your-backend-url.vercel.app/api/indexer/stats
```

## 🎯 **Expected Results**

After successful deployment:

✅ **Frontend loads without errors**
✅ **API calls return real data (not mock data)**
✅ **Top 8 interactions display correctly**
✅ **No more 500 errors in console**
✅ **Performance monitoring works**

## 🚀 **Quick Fix for Immediate Testing**

If you want to test the frontend immediately while deploying the backend:

1. **Start your local backend**:
   ```bash
   node server-enhanced.js
   ```

2. **Update your frontend environment** to point to localhost:
   ```bash
   # In your frontend Vercel deployment
   BACKEND_URL=http://localhost:4000
   ```

3. **Use a tunnel service** like ngrok:
   ```bash
   # Install ngrok
   npm install -g ngrok
   
   # Create tunnel
   ngrok http 4000
   
   # Use the ngrok URL in your frontend environment
   BACKEND_URL=https://your-ngrok-url.ngrok.io
   ```

## 📚 **Additional Resources**

- [Vercel Deployment Guide](https://vercel.com/docs)
- [Neynar API Documentation](https://docs.neynar.com/)
- [CORS Configuration](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

## 🆘 **Need Help?**

If you encounter issues:

1. **Check the logs** in Vercel dashboard
2. **Test locally** first to isolate issues
3. **Verify environment variables** are set correctly
4. **Check CORS configuration** for domain mismatches

The key is to have both frontend and backend deployed on Vercel with proper environment variables configured! 🚀 
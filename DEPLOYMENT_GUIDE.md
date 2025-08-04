# QuickTop8 Deployment Guide

This guide covers testing, debugging, and deploying QuickTop8 to production.

## 🧪 Pre-Deployment Testing

### 1. Run Comprehensive Tests
```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:backend    # Backend tests only
npm run test:frontend   # Frontend tests only
npm run test:api        # API tests only
npm run test:deployment # Full deployment tests
```

### 2. Debug Issues
```bash
# Run debugging tool
npm run debug

# Or run directly
node debug.js
```

### 3. Manual Testing Checklist
- [ ] Backend server starts without errors
- [ ] API endpoints respond correctly
- [ ] Frontend builds successfully
- [ ] Environment variables are set
- [ ] Dependencies are installed
- [ ] Network connectivity works

## 🚀 Deployment Options

### Option 1: Automated Deployment (Recommended)
```bash
# Run tests and deploy
npm run deploy:test

# Or deploy directly
npm run deploy
```

### Option 2: Manual Deployment
```bash
# Deploy to Vercel
vercel --prod
```

### Option 3: GitHub Actions (CI/CD)
The project includes GitHub Actions workflow that automatically:
- Runs tests on every push/PR
- Deploys to production on main branch
- Requires secrets to be configured

## 🔧 Environment Setup

### Required Environment Variables
```bash
# Backend (.env file)
NEYNAR_API_KEY=your_neynar_api_key
NEYNAR_CLIENT_ID=your_neynar_client_id
PORT=4000
NODE_ENV=production

# Frontend (Vercel environment variables)
NEXT_PUBLIC_BACKEND_URL=your_vercel_backend_url
```

### Platform-Specific Setup

#### Vercel (Full Stack)
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

## 🐛 Troubleshooting

### Common Issues

#### 1. Environment Variables Missing
```bash
# Check if variables are set
node debug.js

# Set variables in .env file
echo "NEYNAR_API_KEY=your_key" >> .env
echo "NEYNAR_CLIENT_ID=your_id" >> .env
```

#### 2. Dependencies Issues
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### 3. Build Failures
```bash
# Check frontend build
cd frontend
npm run build

# Check backend
npm run test:backend
```

#### 4. API Issues
```bash
# Test API connectivity
node test-api.js

# Check server startup
node server.js
```

### Debug Commands
```bash
# Comprehensive debugging
npm run debug

# Test specific components
npm run test:api
npm run test:deployment

# Check file structure
ls -la
ls -la frontend/
```

## 📊 Monitoring

### Health Checks
- Backend: `https://your-vercel-url.vercel.app/health`
- Frontend: Check Vercel dashboard for build status

### Logs
- Vercel: Check logs in Vercel dashboard
- Local: `npm run dev` for development logs

## 🔄 Update Process

### 1. Development
```bash
# Make changes
git add .
git commit -m "Update description"
git push origin main
```

### 2. Testing
```bash
# Run tests locally
npm run test

# Check deployment readiness
npm run test:deployment
```

### 3. Deployment
```bash
# Deploy with tests
npm run deploy:test

# Or use GitHub Actions (automatic)
git push origin main
```

## 📋 Deployment Checklist

Before deploying, ensure:

### Backend
- [ ] `server.js` exists and is valid
- [ ] `package.json` has correct dependencies
- [ ] Environment variables are set
- [ ] API tests pass
- [ ] Server starts without errors

### Frontend
- [ ] `frontend/package.json` is valid
- [ ] Next.js config is correct
- [ ] Build process works
- [ ] Linting passes
- [ ] Main page component exists

### Infrastructure
- [ ] Vercel project is connected
- [ ] GitHub repository is up to date
- [ ] Secrets are configured in platforms

### Testing
- [ ] All tests pass locally
- [ ] Debug tool shows no critical issues
- [ ] Manual testing completed
- [ ] API endpoints respond correctly

## 🆘 Support

If you encounter issues:

1. Run `npm run debug` to identify problems
2. Check the troubleshooting section above
3. Review logs in Vercel dashboard
4. Test locally with `npm run dev`
5. Verify environment variables are set correctly

## 📝 Notes

- The deployment script includes comprehensive testing
- GitHub Actions provides automated CI/CD
- Debug tool helps identify common issues
- Environment variables are critical for functionality
- Both backend and frontend are deployed to Vercel 
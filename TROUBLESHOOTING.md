# Friends of Friends Troubleshooting Guide

This guide helps you troubleshoot common issues with the Friends of Friends application, particularly related to Neynar API integration.

## 🚨 Common Issues & Solutions

### 1. API Key Issues

**Problem**: "Invalid API key" or "Unauthorized" errors

**Solutions**:
- Verify your Neynar API key is correct in `frontend/.env`
- Ensure the API key has the necessary permissions
- Check if the API key is active and not expired
- Try regenerating the API key if needed

**Environment Variable Setup**:
```bash
# In frontend/.env
NEYNAR_API_KEY=your_actual_api_key_here
```

### 2. Rate Limiting

**Problem**: "Rate limit exceeded" or "Too many requests" errors

**Solutions**:
- Wait 1-2 minutes before making new requests
- The app implements automatic rate limiting
- Check your Neynar API usage limits
- Consider upgrading your API plan if needed

**Rate Limit Info**:
- Neynar API: 100 requests per minute (free tier)
- App implements intelligent rate limiting
- Automatic retry with exponential backoff

### 3. User Not Found

**Problem**: "User not found" or "Invalid FID" errors

**Solutions**:
- Verify the FID (Farcaster ID) is correct
- Ensure the user exists on Farcaster
- Check if the user has a public profile
- Try with a different FID to test

**FID Validation**:
```javascript
// Valid FID format
const validFid = 12345; // Numeric, positive integer
```

### 4. Network Errors

**Problem**: "Network error" or "Failed to fetch" errors

**Solutions**:
- Check your internet connection
- Verify the app is accessible at friends-of-friends.vercel.app
- Try refreshing the page
- Check if Vercel is experiencing downtime

**Health Check**:
- Visit: https://friends-of-friends.vercel.app/api/health
- Should return: `{"status":"healthy","timestamp":"..."}`

### 5. Mini App Integration Issues

**Problem**: Mini App not loading or wallet not connecting

**Solutions**:
- Ensure you're accessing from within Farcaster
- Check if the Mini App SDK is properly loaded
- Verify the app is approved for Mini App use
- Try refreshing the Mini App

**Mini App Requirements**:
- Must be accessed from Farcaster app
- Requires proper Farcaster Mini App configuration
- Needs valid Farcaster manifest

### 6. Image Loading Issues

**Problem**: Profile pictures not loading

**Solutions**:
- Check if the image URLs are accessible
- Verify the proxy image endpoint is working
- Try refreshing the page
- Check browser console for CORS errors

**Image Proxy Endpoint**:
- URL: `/api/proxy-image?url=...`
- Handles CORS and image optimization
- Falls back gracefully if images fail

### 7. Build Errors

**Problem**: Build failures or deployment issues

**Solutions**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Frontend specific
cd frontend
rm -rf node_modules package-lock.json .next
npm install
npm run build
```

**Common Build Issues**:
- Missing environment variables
- TypeScript errors
- Dependency conflicts
- Memory issues during build

### 8. Performance Issues

**Problem**: Slow loading or unresponsive UI

**Solutions**:
- Check network speed
- Verify API response times
- Clear browser cache
- Try on a different device/network

**Performance Optimization**:
- Images are optimized with Next.js Image
- API calls are cached appropriately
- Bundle size is optimized
- Lazy loading implemented

## 🔧 Development Troubleshooting

### Local Development Issues

**Problem**: App not running locally

**Solutions**:
```bash
# Install dependencies
npm install
cd frontend && npm install

# Start development server
npm run dev

# Check for errors
npm run lint
```

**Common Local Issues**:
- Missing environment variables
- Port conflicts
- Node.js version incompatibility
- Missing dependencies

### API Testing

**Test Endpoints**:
```bash
# Health check
curl https://friends-of-friends.vercel.app/api/health

# Test API
curl https://friends-of-friends.vercel.app/api/test

# User data (replace FID)
curl https://friends-of-friends.vercel.app/api/user/12345
```

### Environment Variables

**Required Variables**:
```bash
# frontend/.env
NEYNAR_API_KEY=your_api_key_here
```

**Optional Variables**:
```bash
# For development
NEXT_PUBLIC_DEBUG=true
NEXT_PUBLIC_API_BASE_URL=https://friends-of-friends.vercel.app
```

## 📊 Monitoring & Debugging

### Health Check Endpoint

**URL**: `https://friends-of-friends.vercel.app/api/health`

**Expected Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "environment": "production"
}
```

### Debug Mode

**Enable Debug Logging**:
```bash
# Add to frontend/.env
NEXT_PUBLIC_DEBUG=true
```

**Debug Information**:
- API call logs
- Error details
- Performance metrics
- User interaction data

### Error Tracking

**Common Error Types**:
1. **API Errors**: Network, rate limiting, authentication
2. **User Errors**: Invalid input, missing data
3. **System Errors**: Build, deployment, configuration
4. **Integration Errors**: Mini App, wallet, Farcaster

## 🆘 Getting Help

### Before Asking for Help

1. **Check the health endpoint**: https://friends-of-friends.vercel.app/api/health
2. **Review this troubleshooting guide**
3. **Check browser console for errors**
4. **Verify environment variables**
5. **Test with a different FID**

### When to Contact Support

- Health endpoint returns error
- API key issues persist
- Mini App integration fails
- Build/deployment problems
- Security concerns

### Useful Resources

1. **Neynar Documentation**: https://docs.neynar.com
2. **Farcaster Mini App SDK**: https://docs.farcaster.xyz/miniapps
3. **Vercel Documentation**: https://vercel.com/docs
4. **Next.js Documentation**: https://nextjs.org/docs

## 🔄 Recovery Procedures

### Complete Reset

If all else fails:

```bash
# 1. Clean everything
rm -rf node_modules package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json frontend/.next

# 2. Reinstall dependencies
npm install
cd frontend && npm install

# 3. Rebuild
npm run build

# 4. Deploy
npx vercel --prod
```

### Data Recovery

**No Data Loss Risk**: The app doesn't store user data, so there's no risk of data loss during troubleshooting.

## 🎯 Prevention Tips

### Best Practices

1. **Regular Health Checks**: Monitor the health endpoint
2. **API Key Management**: Rotate keys regularly
3. **Environment Variables**: Keep them secure and updated
4. **Error Monitoring**: Set up error tracking
5. **Performance Monitoring**: Track loading times

### Maintenance

1. **Update Dependencies**: Regular npm updates
2. **Security Updates**: Keep packages current
3. **API Monitoring**: Track Neynar API usage
4. **Performance Optimization**: Monitor bundle size
5. **User Feedback**: Collect and address issues

---

**Need More Help?** Check the Friends of Friends GitHub repository for updates and additional support resources. 
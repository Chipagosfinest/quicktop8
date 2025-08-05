# QuickTop8 Troubleshooting Guide

## Overview
This guide helps you troubleshoot common issues with the QuickTop8 application, particularly related to Neynar API integration.

## Quick Health Checks

### 1. Health Check Endpoint
Visit `/api/health` to check the overall system status:
- Neynar API connectivity
- Environment configuration
- Service status

### 2. API Test Endpoint
Visit `/api/test` for comprehensive API testing:
- Basic user info test
- Best friends API test
- Rate limiting test (use `?type=rate_limit`)
- Error handling test (use `?type=error_handling`)

## Common Issues & Solutions

### 1. Rate Limiting (429 Errors)

**Symptoms:**
- API returns 429 status code
- "Rate limit exceeded" error messages
- Inconsistent API responses

**Solutions:**
- Wait 1 minute before retrying
- Implement exponential backoff
- Check your Neynar plan limits:
  - Starter: 300 RPM
  - Growth: 600 RPM
  - Scale: 1200 RPM

**Code Fix:**
```typescript
// Add rate limiting to your API calls
function checkRateLimit(endpoint: string): boolean {
  const now = Date.now()
  const key = `neynar-${endpoint}`
  const limit = rateLimitMap.get(key)
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + 60000 })
    return true
  }
  
  if (limit.count >= 250) { // Conservative limit
    return false
  }
  
  limit.count++
  return true
}
```

### 2. API Key Issues

**Symptoms:**
- "API key not configured" errors
- 401 Unauthorized responses
- Missing environment variables

**Solutions:**
1. Check environment variables:
   ```bash
   # Frontend
   NEYNAR_API_KEY=your_api_key_here
   
   # Backend
   NEYNAR_API_KEY=your_api_key_here
   ```

2. Verify API key format:
   - Should be a valid UUID format
   - Check for extra spaces or characters
   - Ensure it's the correct key for your environment

3. Test API key manually:
   ```bash
   curl -H "x-api-key: YOUR_API_KEY" \
        -H "accept: application/json" \
        "https://api.neynar.com/v2/farcaster/user?fid=2"
   ```

### 3. Network Timeouts

**Symptoms:**
- Request timeouts
- AbortError exceptions
- Slow response times

**Solutions:**
1. Increase timeout values:
   ```typescript
   signal: AbortSignal.timeout(10000) // 10 seconds
   ```

2. Implement retry logic:
   ```typescript
   async function makeNeynarRequest(url: string, retries = 3): Promise<Response> {
     for (let i = 0; i < retries; i++) {
       try {
         return await fetch(url, {
           headers: { 
             'x-api-key': NEYNAR_API_KEY, 
             'accept': 'application/json'
           },
           signal: AbortSignal.timeout(10000)
         })
       } catch (error) {
         if (i === retries - 1) throw error
         await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
       }
     }
   }
   ```

### 4. User Not Found (404 Errors)

**Symptoms:**
- 404 responses for valid FIDs
- "User not found" errors
- Missing user data

**Solutions:**
1. Verify FID format:
   - Must be a valid integer
   - Check for leading zeros or special characters

2. Test with known valid FIDs:
   - FID 2 (Dwr) - should always work
   - FID 3 (Vitalik) - should always work

3. Handle gracefully:
   ```typescript
   if (response.status === 404) {
     return NextResponse.json({ 
       error: 'User not found. Please check the FID.',
       debug: { status: response.status, fid: userFid }
     }, { status: 404 })
   }
   ```

### 5. Best Friends API Issues

**Symptoms:**
- Empty best friends list
- Missing mutual affinity scores
- Inconsistent data

**Solutions:**
1. Check API endpoint:
   ```
   GET /v2/farcaster/user/best_friends?fid={fid}&limit=8
   ```

2. Verify response format:
   ```typescript
   const bestFriendsData = await bestFriendsResponse.json()
   const bestFriends = bestFriendsData.users || []
   ```

3. Handle empty results:
   ```typescript
   if (bestFriends.length === 0) {
     return NextResponse.json({ 
       top8: [],
       message: "No best friends found yet. Start interacting with people!"
     })
   }
   ```

## Debugging Tools

### 1. Enhanced Logging
Add detailed logging to track API calls:

```typescript
console.log('🔍 Debug: Fetching Top 8 for FID:', fid)
console.log('🔍 Debug: NEYNAR_API_KEY exists:', !!NEYNAR_API_KEY)
console.log('✅ Found', bestFriends.length, 'best friends')
```

### 2. Error Response Details
Include detailed error information:

```typescript
return NextResponse.json({ 
  error: `Neynar API error: ${response.status}`,
  debug: {
    status: response.status,
    statusText: response.statusText,
    error_details: await response.text()
  }
}, { status: response.status })
```

### 3. Health Monitoring
Use the health check endpoint to monitor system status:

```typescript
// Check health before making API calls
const healthResponse = await fetch('/api/health')
const health = await healthResponse.json()

if (health.services.neynar_api !== 'healthy') {
  // Handle degraded service
}
```

## Environment Configuration

### Frontend (.env.local)
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEYNAR_API_KEY=your_api_key_here
```

### Backend (.env)
```bash
NEYNAR_API_KEY=your_api_key_here
NEYNAR_CLIENT_ID=your_client_id_here
NEYNAR_WEBHOOK_SECRET=your_webhook_secret_here
```

## Testing Checklist

Before deploying, verify:

- [ ] API key is configured correctly
- [ ] Health check passes (`/api/health`)
- [ ] Basic API test passes (`/api/test`)
- [ ] Rate limiting test passes (`/api/test?type=rate_limit`)
- [ ] Error handling test passes (`/api/test?type=error_handling`)
- [ ] Top 8 API returns data (`/api/top8-simple?fid=2`)
- [ ] Embed page loads correctly (`/embed`)

## Getting Help

If you're still experiencing issues:

1. Check the logs for detailed error messages
2. Use the test endpoints to isolate the problem
3. Verify your Neynar API plan and limits
4. Contact Neynar support for API-specific issues
5. Check the QuickTop8 GitHub repository for updates

## Performance Optimization

### 1. Caching
Implement caching for frequently requested data:

```typescript
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCachedData(key: string) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  return null
}
```

### 2. Batch Requests
Group multiple API calls when possible:

```typescript
// Instead of multiple individual calls
const userData = await fetchUserData(fid1)
const userData2 = await fetchUserData(fid2)

// Use batch endpoints when available
const batchResponse = await fetch(`/api/users/batch?fids=${fid1},${fid2}`)
```

### 3. Request Optimization
- Use appropriate timeouts (10 seconds max)
- Implement exponential backoff for retries
- Monitor rate limits proactively
- Cache successful responses

## Monitoring

Set up monitoring for:
- API response times
- Error rates
- Rate limit hits
- User engagement metrics

This will help identify issues before they become problems. 
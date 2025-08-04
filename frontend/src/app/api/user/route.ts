import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory cache for the frontend
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function makeBackendRequest(endpoint: string, params: Record<string, any> = {}) {
  // In production, use the same domain for backend API calls
  const BACKEND_URL = process.env.NODE_ENV === 'production' 
    ? '' // Same domain
    : (process.env.BACKEND_URL || 'http://localhost:4000');
  
  const queryString = new URLSearchParams(params).toString();
  const url = `${BACKEND_URL}${endpoint}?${queryString}`;
  
  const response = await fetch(url, {
    headers: {
      'accept': 'application/json'
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Backend API error: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}

export async function GET(request: NextRequest) {
  try {
    console.log('User API route called')
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    console.log('Auth header present:', !!authHeader)
    
    // For now, let's make auth optional for testing
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid auth header, proceeding without authentication')
      // Continue without auth for now
    }

    const { searchParams } = new URL(request.url)
    const fid = searchParams.get('fid')

    if (!fid) {
      return NextResponse.json(
        { error: 'Missing FID parameter' },
        { status: 400 }
      )
    }

    console.log(`Processing request for FID: ${fid}`)

    // Check cache first
    const cacheKey = `user_${fid}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('Returning cached user data');
      return NextResponse.json({
        ...cached.data,
        cached: true
      });
    }

    // Fetch user info from enhanced backend
    let userData;
    try {
      userData = await makeBackendRequest('/api/user/' + fid);
    } catch (error) {
      console.error('Backend API request failed:', error);
      
      // Return cached data if available, even if expired
      if (cached) {
        console.log('Returning expired cached data due to API failure');
        return NextResponse.json({
          ...cached.data,
          cached: true,
          warning: 'Using cached data due to API failure'
        });
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch user data from backend',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      )
    }

    const user = userData.data?.users?.[0]

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in backend response' },
        { status: 404 }
      )
    }

    console.log(`Processing user: ${user.username} (FID: ${user.fid})`)

    // Get top interactions from enhanced backend
    let topInteractions = [];
    try {
      const topInteractionsResponse = await makeBackendRequest('/api/user/' + fid + '/top-interactions');
      
      if (topInteractionsResponse.success && topInteractionsResponse.data?.topInteractions) {
        topInteractions = topInteractionsResponse.data.topInteractions;
      }
    } catch (error) {
      console.warn('Failed to fetch top interactions:', error);
      // Continue without top interactions
    }

    const responseData = {
      fid: user.fid,
      username: user.username,
      displayName: user.display_name,
      avatar: user.pfp_url,
      bio: user.profile?.bio?.text || '',
      followerCount: user.follower_count,
      followingCount: user.following_count,
      castCount: user.cast_count,
      verified: user.verified_addresses?.length > 0,
      message: 'User data loaded successfully',
      test: false,
      topInteractions: topInteractions,
      cached: false
    };

    // Cache the response
    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error in user API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 
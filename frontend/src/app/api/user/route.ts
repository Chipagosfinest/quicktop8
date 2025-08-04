import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory cache for the frontend
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function makeBackendRequest(endpoint: string, params: Record<string, any> = {}) {
  // Determine backend URL based on environment
  let BACKEND_URL;
  
  if (process.env.NODE_ENV === 'production') {
    // In production, use the deployed Vercel backend
    BACKEND_URL = process.env.BACKEND_URL || 'https://quicktop8-k5zoc4rsj-chipagosfinests-projects.vercel.app';
  } else {
    // In development, use localhost
    BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
  }
  
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Making backend request to: ${BACKEND_URL}${endpoint}`);
  
  const queryString = new URLSearchParams(params).toString();
  const url = `${BACKEND_URL}${endpoint}?${queryString}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      },
      // Add timeout for better error handling
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend API error: ${response.status} - ${errorText}`);
      throw new Error(`Backend API error: ${response.status} - ${errorText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Backend request failed:', error);
    
    // If backend is not available, throw error
    console.log('Backend unavailable - throwing error');
    throw new Error('Backend service unavailable');
    
    throw error;
  }
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
      
      // If no cached data and backend is unavailable, return error
      console.log('Backend unavailable - returning error');
      return NextResponse.json(
        { 
          error: 'Backend service unavailable',
          details: 'Unable to connect to backend service'
        },
        { status: 503 }
      );
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch user data from backend',
          details: error instanceof Error ? error.message : String(error)
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
    let hasTopInteractions = false;
    
    try {
      const topInteractionsResponse = await makeBackendRequest('/api/user/' + fid + '/top-interactions');
      
      if (topInteractionsResponse.success && topInteractionsResponse.data?.topInteractions) {
        topInteractions = topInteractionsResponse.data.topInteractions;
        hasTopInteractions = true;
      } else if (topInteractionsResponse.mock) {
        // Backend returned mock data - skip top interactions
        console.log('Backend returned mock data for top interactions');
        hasTopInteractions = false;
      }
    } catch (error) {
      console.warn('Failed to fetch top interactions:', error);
      
      // Log the error but don't provide mock data
      console.warn('Failed to fetch top interactions from backend:', error);
      hasTopInteractions = false;
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
      hasTopInteractions: hasTopInteractions,
      hasRealData: true,
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
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
} 
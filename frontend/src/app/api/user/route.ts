import { NextRequest, NextResponse } from 'next/server'
import { getIndexer } from '@/lib/indexer'

// Simple in-memory cache for the frontend
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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

    // Get the indexer instance
    const indexer = getIndexer();
    
    // Fetch user info directly from Neynar
    let userData;
    try {
      userData = await indexer.getUserData(fid);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      return NextResponse.json(
        { 
          error: 'Failed to fetch user data',
          details: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
      )
    }

    const user = userData.users?.[0]

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log(`Processing user: ${user.username} (FID: ${user.fid})`)

    // Get top interactions directly from Neynar
    let topInteractions = [];
    let hasTopInteractions = false;
    
    try {
      topInteractions = await indexer.getTopInteractions(fid, 8);
      hasTopInteractions = topInteractions.length > 0;
    } catch (error) {
      console.warn('Failed to fetch top interactions:', error);
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
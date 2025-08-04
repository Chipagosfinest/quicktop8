import { NextRequest, NextResponse } from 'next/server'
import { getNeynarClient } from '@/lib/neynar-client'

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

    // Get the Neynar client
    const client = getNeynarClient();
    
    // Fetch user info using the official SDK
    let userData;
    try {
      const userResponse = await client.fetchBulkUsers({ fids: [parseInt(fid)] });
      userData = userResponse.users?.[0];
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

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log(`Processing user: ${userData.username} (FID: ${userData.fid})`)

    // Get best friends using Neynar's built-in affinity scoring
    let topInteractions: any[] = [];
    let hasTopInteractions = false;
    
    try {
      // Use Neynar's best friends endpoint which ranks by mutual affinity score
      const bestFriendsResponse = await client.fetchUserBestFriends({ fid: parseInt(fid), limit: 8 });
      
      if (bestFriendsResponse.users && bestFriendsResponse.users.length > 0) {
        // Get detailed user data for the best friends
        const bestFriendFids = bestFriendsResponse.users.map(user => user.fid);
        const bulkUsersResponse = await client.fetchBulkUsers({ fids: bestFriendFids });
        
        if (bulkUsersResponse.users) {
          topInteractions = bulkUsersResponse.users.map((user, index) => {
            const bestFriend = bestFriendsResponse.users.find(bf => bf.fid === user.fid);
            
            return {
              fid: user.fid,
              username: user.username,
              displayName: user.display_name,
              avatar: user.pfp_url,
              followerCount: user.follower_count,
              userScore: user.score || 0,
              verified: !!user.verified_addresses,
              interactionCount: bestFriend?.mutual_affinity_score || 0,
              likes: Math.floor((bestFriend?.mutual_affinity_score || 0) * 0.6), // Estimate
              replies: Math.floor((bestFriend?.mutual_affinity_score || 0) * 0.3), // Estimate
              recasts: Math.floor((bestFriend?.mutual_affinity_score || 0) * 0.1)  // Estimate
            };
          });
          
          hasTopInteractions = topInteractions.length > 0;
        }
      }
    } catch (error) {
      console.error('Failed to fetch best friends:', error);
      hasTopInteractions = false;
      // Log the specific error for debugging
      if (error instanceof Error) {
        console.error('Best friends error:', error.message);
      }
      // Don't throw error, just return empty interactions
    }

    const responseData = {
      fid: userData.fid,
      username: userData.username,
      displayName: userData.display_name,
      avatar: userData.pfp_url,
      bio: userData.profile?.bio?.text || '',
      followerCount: userData.follower_count,
      followingCount: userData.following_count,
      castCount: 0, // TODO: Implement cast count when available in SDK
      verified: !!userData.verified_addresses,
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
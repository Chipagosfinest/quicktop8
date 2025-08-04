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

    // Get top interactions using the official SDK
    let topInteractions: any[] = [];
    let hasTopInteractions = false;
    
    try {
      // Get user's casts to analyze interactions
      const castsResponse = await client.fetchCastsForUser({ fid: parseInt(fid), limit: 50 });
      
      if (castsResponse.casts && castsResponse.casts.length > 0) {
        // Extract interaction data from casts
        const interactionMap = new Map();
        
        for (const cast of castsResponse.casts) {
          // Count likes
          if (cast.reactions?.likes) {
            for (const like of cast.reactions.likes) {
              const likeFid = like.fid;
              if (!interactionMap.has(likeFid)) {
                interactionMap.set(likeFid, { likes: 0, replies: 0, recasts: 0 });
              }
              interactionMap.get(likeFid).likes++;
            }
          }
          
          // Count replies
          if (cast.replies?.casts) {
            for (const reply of cast.replies.casts) {
              const replyFid = reply.author.fid;
              if (!interactionMap.has(replyFid)) {
                interactionMap.set(replyFid, { likes: 0, replies: 0, recasts: 0 });
              }
              interactionMap.get(replyFid).replies++;
            }
          }
          
          // Count recasts
          if (cast.recasts?.recasts) {
            for (const recast of cast.recasts.recasts) {
              const recastFid = recast.user.fid;
              if (!interactionMap.has(recastFid)) {
                interactionMap.set(recastFid, { likes: 0, replies: 0, recasts: 0 });
              }
              interactionMap.get(recastFid).recasts++;
            }
          }
        }
        
        // Get user data for top interactions
        const topFids = Array.from(interactionMap.entries())
          .sort((a, b) => {
            const aTotal = a[1].likes + a[1].replies + a[1].recasts;
            const bTotal = b[1].likes + b[1].replies + b[1].recasts;
            return bTotal - aTotal;
          })
          .slice(0, 8)
          .map(([fid]) => fid);
        
        if (topFids.length > 0) {
          const bulkUsersResponse = await client.fetchBulkUsers({ fids: topFids });
          
          if (bulkUsersResponse.users) {
            topInteractions = bulkUsersResponse.users.map(user => {
              const interactions = interactionMap.get(user.fid) || { likes: 0, replies: 0, recasts: 0 };
              const totalInteractions = interactions.likes + interactions.replies + interactions.recasts;
              
              return {
                fid: user.fid,
                username: user.username,
                displayName: user.displayName,
                avatar: user.pfpUrl,
                followerCount: user.followerCount,
                userScore: user.score || 0,
                verified: user.verifiedAddresses?.length > 0,
                interactionCount: totalInteractions,
                likes: interactions.likes,
                replies: interactions.replies,
                recasts: interactions.recasts
              };
            });
            
            hasTopInteractions = topInteractions.length > 0;
          }
        }
      }
    } catch (error) {
      console.warn('Failed to fetch top interactions:', error);
      hasTopInteractions = false;
    }

    const responseData = {
      fid: userData.fid,
      username: userData.username,
      displayName: userData.displayName,
      avatar: userData.pfpUrl,
      bio: userData.profile?.bio?.text || '',
      followerCount: userData.followerCount,
      followingCount: userData.followingCount,
      castCount: userData.castCount,
      verified: userData.verifiedAddresses?.length > 0,
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
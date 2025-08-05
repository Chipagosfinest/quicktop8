import { NextRequest, NextResponse } from 'next/server'

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY

// Neynar-specific rate limiting (300 RPM for starter plan)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(endpoint: string): boolean {
  const now = Date.now()
  const key = `neynar-${endpoint}`
  const limit = rateLimitMap.get(key)
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + 60000 }) // 1 minute window
    return true
  }
  
  // Conservative limit: 250 requests per minute to stay well under 300 RPM
  if (limit.count >= 250) {
    console.warn(`Rate limit exceeded for ${endpoint}`)
    return false
  }
  
  limit.count++
  return true
}

async function makeNeynarRequest(url: string, options: RequestInit = {}): Promise<Response> {
  if (!NEYNAR_API_KEY) {
    throw new Error('NEYNAR_API_KEY is not configured')
  }

  const defaultOptions: RequestInit = {
    headers: { 
      'x-api-key': NEYNAR_API_KEY, 
      'accept': 'application/json',
      'user-agent': 'QuickTop8/1.0'
    },
    signal: AbortSignal.timeout(10000) // 10 second timeout
  }

  return fetch(url, { ...defaultOptions, ...options })
}

export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)
  const { searchParams } = new URL(request.url)
  const userFid = searchParams.get('fid')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 8 // Always 8 per page for Top 8 concept
  const offset = (page - 1) * limit

  console.log(`🔍 [${requestId}] Top 8 request for FID: ${userFid}, Page: ${page}`)

  if (!userFid) {
    console.error(`❌ [${requestId}] No FID provided`)
    return NextResponse.json({ error: 'FID parameter is required' }, { status: 400 })
  }

  const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY
  if (!NEYNAR_API_KEY) {
    console.error(`❌ [${requestId}] NEYNAR_API_KEY not configured`)
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  // Rate limiting check
  if (!checkRateLimit('top8-simple')) {
    return NextResponse.json({ 
      error: 'Rate limit exceeded. Please try again in 1 minute.' 
    }, { status: 429 })
  }

  try {
    // Test Neynar API connectivity first
    const testResponse = await makeNeynarRequest(`https://api.neynar.com/v2/farcaster/user/bulk/?fids=${userFid}`)
    
    if (!testResponse.ok) {
      console.error(`❌ [${requestId}] User lookup failed: ${testResponse.status}`)
      return NextResponse.json({ 
        error: 'User not found. Please check the FID.' 
      }, { status: 404 })
    }

    // Fetch best friends with pagination
    const bestFriendsResponse = await makeNeynarRequest(
      `https://api.neynar.com/v2/farcaster/user/best_friends?fid=${userFid}&limit=50` // Get more to support pagination
    )

    if (!bestFriendsResponse.ok) {
      console.error(`❌ [${requestId}] Best friends API error: ${bestFriendsResponse.status}`)
      return NextResponse.json({ 
        error: 'Failed to fetch best friends' 
      }, { status: bestFriendsResponse.status })
    }

    const bestFriendsData = await bestFriendsResponse.json()
    const allBestFriends = bestFriendsData.users || []

    console.log(`✅ [${requestId}] Found ${allBestFriends.length} total best friends`)

    // Apply pagination
    const paginatedBestFriends = allBestFriends.slice(offset, offset + limit)

    if (paginatedBestFriends.length === 0) {
      return NextResponse.json({
        top8: [],
        stats: null,
        hasMore: false,
        debug: {
          request_id: requestId,
          total_friends: allBestFriends.length,
          page: page,
          offset: offset,
          rate_limits_checked: true
        }
      })
    }

    // Get full user details for each best friend in current page
    const fids = paginatedBestFriends.map((friend: any) => friend.fid).join(',')
    
    if (!checkRateLimit('user-details')) {
      return NextResponse.json({ 
        error: 'Rate limit exceeded. Please try again in 1 minute.' 
      }, { status: 429 })
    }

    const userDetailsResponse = await makeNeynarRequest(`https://api.neynar.com/v2/farcaster/user/bulk/?fids=${fids}`)
    
    if (!userDetailsResponse.ok) {
      console.error(`❌ [${requestId}] User details API error: ${userDetailsResponse.status}`)
      return NextResponse.json({ 
        error: 'Failed to fetch user details' 
      }, { status: userDetailsResponse.status })
    }

    const userDetailsData = await userDetailsResponse.json()
    const userDetails = userDetailsData.users || []

    // Create a map for quick lookup
    const userDetailsMap = new Map(userDetails.map((user: any) => [user.fid, user]))

    // Build Top 8 with enhanced data
    const top8 = paginatedBestFriends.map((friend: any, index: number) => {
      const userDetail = userDetailsMap.get(friend.fid) || {}
      const globalRank = offset + index + 1
      
      return {
        fid: friend.fid,
        username: friend.username || `user${friend.fid}`,
        display_name: (userDetail as any).display_name || (friend as any).display_name || '',
        pfp_url: (userDetail as any).pfp_url || (friend as any).pfp_url || '',
        bio: (userDetail as any).bio || (friend as any).bio || '',
        ens_name: (userDetail as any).ens_name || (friend as any).ens_name || '',
        mutual_affinity_score: friend.mutual_affinity_score || 0,
        rank: globalRank, // Global rank across all pages
        verified: (userDetail as any).verified || false,
        follower_count: (userDetail as any).follower_count || 0,
        following_count: (userDetail as any).following_count || 0,
        // Add social scope data for connections of connections
        social_scope: {
          friends_of_friends: [], // Will be populated if available
          network_stats: {
            total_mutual_friends: 0,
            total_friends_of_friends: 0,
            network_density: 0
          }
        }
      }
    })

    // Fetch friends of friends for each user (limited to avoid rate limits)
    for (let i = 0; i < top8.length; i++) { // Fetch for all users in current page
      const user = top8[i]
      try {
        const friendFriendsResponse = await makeNeynarRequest(
          `https://api.neynar.com/v2/farcaster/user/best_friends?fid=${user.fid}&limit=5`
        )
        
        if (friendFriendsResponse.ok) {
          const friendFriendsData = await friendFriendsResponse.json()
          const friendFriends = friendFriendsData.users || []
          
          user.social_scope.friends_of_friends = friendFriends.slice(0, 4).map((friend: any) => ({
            fid: friend.fid,
            username: friend.username,
            display_name: friend.display_name || '',
            pfp_url: friend.pfp_url || '',
            mutual_affinity_score: friend.mutual_affinity_score || 0,
            connected_via: user.username
          }))
          
          user.social_scope.network_stats.total_friends_of_friends = friendFriends.length
        }
        
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (error) {
        console.error(`❌ [${requestId}] Error fetching friends of friends for ${user.username}:`, error)
      }
    }

    // Calculate stats for all users (not just current page)
    const totalUsers = allBestFriends.length
    const averageAffinity = allBestFriends.reduce((sum: number, friend: any) => sum + (friend.mutual_affinity_score || 0), 0) / totalUsers
    const topAffinity = Math.max(...allBestFriends.map((friend: any) => friend.mutual_affinity_score || 0))
    const totalFollowers = userDetails.reduce((sum: number, user: any) => sum + (user.follower_count || 0), 0)
    const totalFollowing = userDetails.reduce((sum: number, user: any) => sum + (user.following_count || 0), 0)
    const verifiedUsers = userDetails.filter((user: any) => user.verified).length

    const stats = {
      total_users: totalUsers,
      average_affinity_score: averageAffinity,
      top_affinity_score: topAffinity,
      total_followers: totalFollowers,
      total_following: totalFollowing,
      verified_users: verifiedUsers
    }

    console.log(`✅ [${requestId}] Built Top 8 for page ${page}, hasMore: ${offset + limit < totalUsers}`)

    return NextResponse.json({
      top8,
      stats,
      hasMore: offset + limit < totalUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      debug: {
        request_id: requestId,
        best_friends_found: allBestFriends.length,
        top8_built: top8.length,
        page: page,
        offset: offset,
        rate_limits_checked: true
      }
    })

  } catch (error) {
    console.error(`❌ [${requestId}] Top 8 error:`, error)
    return NextResponse.json({ 
      error: 'Failed to fetch Top 8' 
    }, { status: 500 })
  }
} 
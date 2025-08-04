import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('User API route called')
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const { searchParams } = new URL(request.url)
    const fid = searchParams.get('fid')

    if (!fid) {
      return NextResponse.json(
        { error: 'Missing FID parameter' },
        { status: 400 }
      )
    }

    console.log(`Processing request for FID: ${fid}`)
    console.log(`Token present: ${!!token}`)

    // Get Neynar API key from environment
    const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY

    if (!NEYNAR_API_KEY) {
      return NextResponse.json(
        { error: 'Neynar API key not configured' },
        { status: 500 }
      )
    }

    // Fetch user info from Neynar
    const userResponse = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`, {
      headers: {
        'accept': 'application/json',
        'api_key': NEYNAR_API_KEY
      }
    })

    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error(`Neynar user API failed: ${userResponse.status} - ${userResponse.statusText}`)
      console.error('Error response:', errorText)
      return NextResponse.json(
        { error: `Neynar user API failed: ${userResponse.status}`, details: errorText },
        { status: userResponse.status }
      )
    }

    const userData = await userResponse.json()
    const user = userData.users?.[0]

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in Neynar response' },
        { status: 404 }
      )
    }

    console.log(`Processing user: ${user.username} (FID: ${user.fid})`)

    // Step 1: Fetch user's recent casts to analyze who interacts with them
    const userCastsResponse = await fetch(`https://api.neynar.com/v2/farcaster/feed/user/popular/?fid=${fid}&viewer_fid=${fid}&limit=30`, {
      headers: {
        'accept': 'application/json',
        'api_key': NEYNAR_API_KEY
      }
    })

    if (!userCastsResponse.ok) {
      const errorText = await userCastsResponse.text()
      console.error(`Neynar user casts API failed: ${userCastsResponse.status} - ${userCastsResponse.statusText}`)
      console.error('Error response:', errorText)
      return NextResponse.json(
        { error: `Neynar user casts API failed: ${userCastsResponse.status}`, details: errorText },
        { status: userCastsResponse.status }
      )
    }

    const userCastsData = await userCastsResponse.json()
    const userCasts = userCastsData.casts || []
    console.log(`Fetched ${userCasts.length} user casts`)

    // Step 2: Fetch user's recent replies to others (increased limit for better analysis)
    const userRepliesResponse = await fetch(`https://api.neynar.com/v2/farcaster/feed/user/replies/?fid=${fid}&viewer_fid=${fid}&limit=30`, {
      headers: {
        'accept': 'application/json',
        'api_key': NEYNAR_API_KEY
      }
    })

    if (!userRepliesResponse.ok) {
      const errorText = await userRepliesResponse.text()
      console.error(`Neynar user replies API failed: ${userRepliesResponse.status} - ${userRepliesResponse.statusText}`)
      console.error('Error response:', errorText)
      return NextResponse.json(
        { error: `Neynar user replies API failed: ${userRepliesResponse.status}`, details: errorText },
        { status: userRepliesResponse.status }
      )
    }

    const userRepliesData = await userRepliesResponse.json()
    const userReplies = userRepliesData.casts || []
    console.log(`Fetched ${userReplies.length} user replies`)

    // Step 3: Build interaction map from user's casts
    const interactionMap = new Map()
    
    // Process user's casts to find who interacts with them
    for (const cast of userCasts) {
      // Count likes
      if (cast.reactions?.likes) {
        for (const like of cast.reactions.likes) {
          const likerFid = like.fid
          if (!interactionMap.has(likerFid)) {
            interactionMap.set(likerFid, { likes: 0, replies: 0, recasts: 0, total: 0 })
          }
          const stats = interactionMap.get(likerFid)
          stats.likes++
          stats.total++
        }
      }

      // Count recasts
      if (cast.reactions?.recasts) {
        for (const recast of cast.reactions.recasts) {
          const recasterFid = recast.fid
          if (!interactionMap.has(recasterFid)) {
            interactionMap.set(recasterFid, { likes: 0, replies: 0, recasts: 0, total: 0 })
          }
          const stats = interactionMap.get(recasterFid)
          stats.recasts++
          stats.total++
        }
      }

      // Count replies
      if (cast.replies?.count > 0) {
        // For replies, we need to fetch the actual replies to this cast
        try {
          const castRepliesResponse = await fetch(`https://api.neynar.com/v2/farcaster/feed/cast/replies/?identifier=${cast.hash}&viewer_fid=${fid}&limit=10`, {
            headers: {
              'accept': 'application/json',
              'api_key': NEYNAR_API_KEY
            }
          })
          
          if (castRepliesResponse.ok) {
            const castRepliesData = await castRepliesResponse.json()
            const castReplies = castRepliesData.casts || []
            
            for (const reply of castReplies) {
              const replierFid = reply.author.fid
              if (!interactionMap.has(replierFid)) {
                interactionMap.set(replierFid, { likes: 0, replies: 0, recasts: 0, total: 0 })
              }
              const stats = interactionMap.get(replierFid)
              stats.replies++
              stats.total++
            }
          }
        } catch (error) {
          console.error('Error fetching cast replies:', error)
        }
      }
    }

    // Step 4: Process user's replies to find who they interact with
    for (const reply of userReplies) {
      const targetFid = reply.parent_author?.fid
      if (targetFid) {
        if (!interactionMap.has(targetFid)) {
          interactionMap.set(targetFid, { likes: 0, replies: 0, recasts: 0, total: 0 })
        }
        const stats = interactionMap.get(targetFid)
        stats.replies++
        stats.total++
      }
    }

    console.log(`Built interaction map with ${interactionMap.size} unique users`)

    // Step 5: Get user profiles for top interactors
    const topFids = Array.from(interactionMap.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 20)
      .map(([fid]) => fid)

    if (topFids.length === 0) {
      return NextResponse.json(
        { error: 'No interactions found', details: 'No user interactions available for analysis' },
        { status: 404 }
      )
    }

    // Fetch user profiles for top interactors
    const bulkUsersResponse = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${topFids.join(',')}`, {
      headers: {
        'accept': 'application/json',
        'api_key': NEYNAR_API_KEY
      }
    })

    if (!bulkUsersResponse.ok) {
      const errorText = await bulkUsersResponse.text()
      console.error(`Neynar bulk users API failed: ${bulkUsersResponse.status} - ${bulkUsersResponse.statusText}`)
      console.error('Error response:', errorText)
      return NextResponse.json(
        { error: `Neynar bulk users API failed: ${bulkUsersResponse.status}`, details: errorText },
        { status: bulkUsersResponse.status }
      )
    }

    const bulkUsersData = await bulkUsersResponse.json()
    const userProfiles = bulkUsersData.users || []

    // Step 6: Build final top interactions list
    let topInteractions: any[] = []
    
    for (const [fid, stats] of interactionMap.entries()) {
      const userProfile = userProfiles.find((u: any) => u.fid === fid)
      if (userProfile) {
        topInteractions.push({
          fid: userProfile.fid,
          username: userProfile.username,
          displayName: userProfile.display_name,
          avatar: userProfile.pfp_url,
          bio: userProfile.profile?.bio?.text || '',
          followerCount: userProfile.follower_count,
          followingCount: userProfile.following_count,
          interactionCount: stats.total,
          likes: stats.likes,
          replies: stats.replies,
          recasts: stats.recasts,
          verified: userProfile.verified_addresses?.length > 0
        })
      }
    }

    // Sort by total interactions
    topInteractions.sort((a, b) => b.interactionCount - a.interactionCount)

    // Take top 8 for display
    topInteractions = topInteractions.slice(0, 8)

    if (topInteractions.length === 0) {
      return NextResponse.json(
        { error: 'No valid interactions found', details: 'No valid user interactions available for display' },
        { status: 404 }
      )
    }

    const response = {
      fid: parseInt(fid),
      username: user.username,
      displayName: user.display_name,
      avatar: user.pfp_url,
      bio: user.profile?.bio?.text || '',
      followerCount: user.follower_count,
      followingCount: user.following_count,
      castCount: user.cast_count,
      joinedAt: user.registered_at,
      verified: user.verified_addresses?.length > 0,
      topInteractions,
      message: 'Real interaction data from Neynar API!',
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error processing user request:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 
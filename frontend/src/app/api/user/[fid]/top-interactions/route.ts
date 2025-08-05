import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fid: string }> }
) {
  const requestId = Math.random().toString(36).substring(7)
  
  try {
    const { fid } = await params
    console.log(`🔍 [${requestId}] Discovery request for FID: ${fid}`)

    const userFid = parseInt(fid)
    if (!userFid || isNaN(userFid)) {
      console.error(`❌ [${requestId}] Invalid FID: ${fid}`)
      return NextResponse.json({ error: 'Invalid FID provided' }, { status: 400 })
    }

    const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY
    if (!NEYNAR_API_KEY) {
      console.error(`❌ [${requestId}] NEYNAR_API_KEY not configured`)
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    // Rate limiting check
    const checkRateLimit = (endpoint: string) => {
      // Simple rate limiting - in production you'd use Redis or similar
      return true
    }

    if (!checkRateLimit('discovery')) {
      return NextResponse.json({ 
        error: 'Rate limit exceeded. Please try again in 1 minute.' 
      }, { status: 429 })
    }

    // Fetch user's best friends first
    const bestFriendsResponse = await fetch(
      `https://api.neynar.com/v2/farcaster/user/best_friends?fid=${userFid}&limit=20`,
      {
        headers: {
          'x-api-key': NEYNAR_API_KEY,
        },
      }
    )

    if (!bestFriendsResponse.ok) {
      console.error(`❌ [${requestId}] Best friends API error: ${bestFriendsResponse.status}`)
      return NextResponse.json({ 
        error: 'Failed to fetch best friends' 
      }, { status: bestFriendsResponse.status })
    }

    const bestFriendsData = await bestFriendsResponse.json()
    const bestFriends = bestFriendsData.users || []

    console.log(`✅ [${requestId}] Found ${bestFriends.length} best friends`)

    // Fetch friends of friends for discovery
    const discoveryUsers = []
    const processedFids = new Set([userFid])

    for (const friend of bestFriends.slice(0, 5)) { // Limit to top 5 friends to avoid rate limits
      if (processedFids.has(friend.fid)) continue
      processedFids.add(friend.fid)

      try {
        const friendFriendsResponse = await fetch(
          `https://api.neynar.com/v2/farcaster/user/best_friends?fid=${friend.fid}&limit=10`,
          {
            headers: {
              'x-api-key': NEYNAR_API_KEY,
            },
          }
        )

        if (friendFriendsResponse.ok) {
          const friendFriendsData = await friendFriendsResponse.json()
          const friendFriends = friendFriendsData.users || []

          for (const friendOfFriend of friendFriends) {
            if (!processedFids.has(friendOfFriend.fid)) {
              processedFids.add(friendOfFriend.fid)
              discoveryUsers.push({
                ...friendOfFriend,
                connected_via: friend.username,
                connection_strength: friend.mutual_affinity_score
              })
            }
          }
        }

        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`❌ [${requestId}] Error fetching friends of ${friend.username}:`, error)
      }
    }

    // Sort by connection strength and remove duplicates
    const uniqueDiscoveryUsers = discoveryUsers
      .filter((user, index, self) => 
        index === self.findIndex(u => u.fid === user.fid)
      )
      .sort((a, b) => b.connection_strength - a.connection_strength)
      .slice(0, 20) // Limit to top 20 discoveries

    console.log(`✅ [${requestId}] Found ${uniqueDiscoveryUsers.length} discovery users`)

    return NextResponse.json({
      discovery_users: uniqueDiscoveryUsers,
      total_discovered: uniqueDiscoveryUsers.length,
      source_user_fid: userFid,
      debug: {
        request_id: requestId,
        best_friends_checked: bestFriends.length,
        rate_limits_checked: true
      }
    })

  } catch (error) {
    console.error(`❌ [${requestId}] Discovery error:`, error)
    return NextResponse.json({ 
      error: 'Failed to fetch discovery data' 
    }, { status: 500 })
  }
} 
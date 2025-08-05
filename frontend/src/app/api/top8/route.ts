import { NextRequest, NextResponse } from 'next/server'

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY

interface Top8User {
  fid: number
  username: string
  display_name: string
  pfp_url: string
  bio: string
  ens_name?: string
  mutual_affinity_score: number
  rank: number
  // Their top 3 friends
  top_friends?: Array<{
    fid: number
    username: string
    display_name: string
    pfp_url: string
    bio: string
    ens_name?: string
    mutual_affinity_score: number
    neynar_user_score?: number
  }>
  // Social scope - who they're connected to in your network
  social_scope?: {
    mutual_friends: Array<{
      fid: number
      username: string
      display_name: string
      pfp_url: string
      mutual_affinity_score: number
    }>
    friends_of_friends: Array<{
      fid: number
      username: string
      display_name: string
      pfp_url: string
      mutual_affinity_score: number
      connected_via: string // who connects them
    }>
    network_stats: {
      total_mutual_friends: number
      total_friends_of_friends: number
      network_density: number // percentage of your network they're connected to
    }
  }
}

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(key: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(key)
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + 60000 }) // 1 minute window
    return true
  }
  
  if (limit.count >= 10) { // 10 requests per minute
    return false
  }
  
  limit.count++
  return true
}

async function fetchBestFriends(fid: number, limit: number = 8): Promise<any[]> {
  if (!checkRateLimit('best-friends')) {
    console.warn('Rate limit exceeded for best friends')
    return []
  }
  
  if (!NEYNAR_API_KEY) {
    console.error('NEYNAR_API_KEY is not configured')
    return []
  }
  
  try {
    const response = await fetch(`https://api.neynar.com/v2/farcaster/user/best_friends?fid=${fid}&limit=${limit}`, {
      headers: { 
        'x-api-key': NEYNAR_API_KEY, 
        'accept': 'application/json' 
      },
      signal: AbortSignal.timeout(8000)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.users || []
  } catch (error) {
    console.error('Error fetching best friends:', error)
    return []
  }
}

async function fetchUserData(fid: number): Promise<any> {
  if (!checkRateLimit('user-data')) {
    console.warn('Rate limit exceeded for user data')
    return null
  }
  
  if (!NEYNAR_API_KEY) {
    console.error('NEYNAR_API_KEY is not configured')
    return null
  }
  
  try {
    const response = await fetch(`https://api.neynar.com/v2/farcaster/user?fid=${fid}`, {
      headers: { 
        'x-api-key': NEYNAR_API_KEY, 
        'accept': 'application/json',
        'x-neynar-experimental': 'true'
      },
      signal: AbortSignal.timeout(8000)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.user || null
  } catch (error) {
    console.error('Error fetching user data:', error)
    return null
  }
}

async function fetchUserFollowing(fid: number): Promise<number[]> {
  if (!checkRateLimit('following')) {
    console.warn('Rate limit exceeded for following')
    return []
  }
  
  if (!NEYNAR_API_KEY) {
    console.error('NEYNAR_API_KEY is not configured')
    return []
  }
  
  try {
    const response = await fetch(`https://api.neynar.com/v2/farcaster/following?fid=${fid}&limit=100`, {
      headers: { 
        'x-api-key': NEYNAR_API_KEY, 
        'accept': 'application/json' 
      },
      signal: AbortSignal.timeout(8000)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.users?.map((user: any) => user.fid) || []
  } catch (error) {
    console.error('Error fetching following:', error)
    return []
  }
}

async function fetchUserFollowers(fid: number): Promise<number[]> {
  if (!checkRateLimit('followers')) {
    console.warn('Rate limit exceeded for followers')
    return []
  }
  
  if (!NEYNAR_API_KEY) {
    console.error('NEYNAR_API_KEY is not configured')
    return []
  }
  
  try {
    const response = await fetch(`https://api.neynar.com/v2/farcaster/followers?fid=${fid}&limit=100`, {
      headers: { 
        'x-api-key': NEYNAR_API_KEY, 
        'accept': 'application/json' 
      },
      signal: AbortSignal.timeout(8000)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.users?.map((user: any) => user.fid) || []
  } catch (error) {
    console.error('Error fetching followers:', error)
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fid = searchParams.get('fid')
    
    if (!fid) {
      return NextResponse.json({ error: 'FID parameter is required' }, { status: 400 })
    }

    console.log('Fetching Top 8 for FID:', fid)
    
    const userFid = parseInt(fid)
    
    // Get user's top 8 best friends
    const bestFriends = await fetchBestFriends(userFid, 8)
    
    if (bestFriends.length === 0) {
      return NextResponse.json({ 
        top8: [],
        stats: {
          total_users: 0,
          average_affinity_score: 0,
          top_affinity_score: 0
        }
      })
    }

    // Get user's own following/followers for network analysis
    const userFollowing = await fetchUserFollowing(userFid)
    const userFollowers = await fetchUserFollowers(userFid)
    const userMutualConnections = userFollowing.filter(fid => userFollowers.includes(fid))

    const top8: Top8User[] = []
    let totalAffinityScore = 0
    let topAffinityScore = 0

    for (let i = 0; i < bestFriends.length; i++) {
      const friend = bestFriends[i]
      const userData = await fetchUserData(friend.fid)
      
      if (!userData) continue

      const affinityScore = friend.mutual_affinity_score || 0
      totalAffinityScore += affinityScore
      if (affinityScore > topAffinityScore) {
        topAffinityScore = affinityScore
      }

      // Get this friend's top 3 friends (excluding the original user)
      const friendBestFriends = await fetchBestFriends(friend.fid, 4) // Get 4 to account for exclusion
      const friendTopFriends = friendBestFriends
        .filter(bf => bf.fid !== userFid) // Exclude original user
        .slice(0, 3)
        .map(async (bf) => {
          const bfUserData = await fetchUserData(bf.fid)
          return {
            fid: bf.fid,
            username: bfUserData?.username || `user${bf.fid}`,
            display_name: bfUserData?.display_name || '',
            pfp_url: bfUserData?.pfp_url || '',
            bio: bfUserData?.bio || '',
            ens_name: bfUserData?.ens_name || '',
            mutual_affinity_score: bf.mutual_affinity_score || 0,
            neynar_user_score: bfUserData?.experimental?.neynar_user_score
          }
        })

      // Get friend's following/followers for social scope analysis
      const friendFollowing = await fetchUserFollowing(friend.fid)
      const friendFollowers = await fetchUserFollowers(friend.fid)
      
      // Find mutual friends (people both you and this friend follow)
      const mutualFriends = userFollowing.filter(fid => friendFollowing.includes(fid))
      
      // Find friends of friends (people your friend follows that you don't)
      const friendsOfFriends = friendFollowing.filter(fid => 
        !userFollowing.includes(fid) && fid !== userFid
      )

      // Get user data for mutual friends and friends of friends
      const mutualFriendsData = await Promise.all(
        mutualFriends.slice(0, 5).map(async (fid) => {
          const userData = await fetchUserData(fid)
          return {
            fid,
            username: userData?.username || `user${fid}`,
            display_name: userData?.display_name || '',
            pfp_url: userData?.pfp_url || '',
            mutual_affinity_score: 0 // We don't have this data for mutual friends
          }
        })
      )

      const friendsOfFriendsData = await Promise.all(
        friendsOfFriends.slice(0, 5).map(async (fid) => {
          const userData = await fetchUserData(fid)
          return {
            fid,
            username: userData?.username || `user${fid}`,
            display_name: userData?.display_name || '',
            pfp_url: userData?.pfp_url || '',
            mutual_affinity_score: 0,
            connected_via: friend.username
          }
        })
      )

      const resolvedTopFriends = await Promise.all(friendTopFriends)

      const top8User: Top8User = {
        fid: friend.fid,
        username: userData.username || `user${friend.fid}`,
        display_name: userData.display_name || '',
        pfp_url: userData.pfp_url || '',
        bio: userData.bio || '',
        ens_name: userData.ens_name || '',
        mutual_affinity_score: affinityScore,
        rank: i + 1,
        top_friends: resolvedTopFriends,
        social_scope: {
          mutual_friends: mutualFriendsData,
          friends_of_friends: friendsOfFriendsData,
          network_stats: {
            total_mutual_friends: mutualFriends.length,
            total_friends_of_friends: friendsOfFriends.length,
            network_density: userFollowing.length > 0 ? 
              (mutualFriends.length / userFollowing.length) * 100 : 0
          }
        }
      }

      top8.push(top8User)
    }

    const stats = {
      total_users: top8.length,
      average_affinity_score: top8.length > 0 ? totalAffinityScore / top8.length : 0,
      top_affinity_score: topAffinityScore
    }

    console.log(`Top 8 fetched successfully for FID ${fid}:`, top8.length, 'users')

    return NextResponse.json({
      top8,
      stats
    })

  } catch (error) {
    console.error('Error in Top 8 API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Top 8 data' },
      { status: 500 }
    )
  }
} 
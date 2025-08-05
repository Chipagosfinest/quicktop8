import { NextRequest, NextResponse } from "next/server"

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || "1E58A226-A64C-4CF3-A047-FBED94F36101"

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
}

// Simple rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 30 // requests per minute
const RATE_WINDOW = 60000 // 1 minute

function checkRateLimit(endpoint: string): boolean {
  const now = Date.now()
  const key = `${endpoint}:${Math.floor(now / RATE_WINDOW)}`
  const current = requestCounts.get(key) || { count: 0, resetTime: now + RATE_WINDOW }
  
  if (now > current.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + RATE_WINDOW })
    return true
  }
  
  if (current.count >= RATE_LIMIT) {
    return false
  }
  
  current.count++
  requestCounts.set(key, current)
  return true
}

// Fetch user's best friends using Neynar's best friends API
async function fetchBestFriends(fid: number, limit: number = 8): Promise<any[]> {
  if (!checkRateLimit('best-friends')) {
    console.warn('Rate limit exceeded for best friends')
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
      console.error(`Failed to fetch best friends for FID ${fid}: ${response.status}`)
      return []
    }
    
    const data = await response.json()
    return data.users || []
  } catch (error) {
    console.error(`Error fetching best friends for FID ${fid}:`, error)
    return []
  }
}

// Fetch user data with caching
const userDataCache = new Map<number, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function fetchUserData(fid: number): Promise<any> {
  const cached = userDataCache.get(fid)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  if (!checkRateLimit('user-data')) {
    console.warn('Rate limit exceeded for user data')
    return {}
  }

  try {
    const response = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`, {
      headers: { 
        'x-api-key': NEYNAR_API_KEY, 
        'accept': 'application/json',
        'x-neynar-experimental': 'true'
      },
      signal: AbortSignal.timeout(8000)
    })
    
    if (!response.ok) {
      console.error(`Failed to fetch user data for FID ${fid}: ${response.status}`)
      return {}
    }
    
    const data = await response.json()
    const user = data.users?.[0]
    
    if (user) {
      userDataCache.set(fid, { data: user, timestamp: Date.now() })
      return user
    }
    
    return {}
  } catch (error) {
    console.error(`Error fetching user data for FID ${fid}:`, error)
    return {}
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fid = searchParams.get('fid')

    if (!fid) {
      return NextResponse.json({ error: "FID is required" }, { status: 400 })
    }

    console.log(`Fetching Top 8 for FID: ${fid}`)

    // Step 1: Get user's best friends (Top 8)
    const bestFriends = await fetchBestFriends(parseInt(fid), 8)
    console.log(`Found ${bestFriends.length} best friends`)

    if (bestFriends.length === 0) {
      return NextResponse.json({ 
        top8: [],
        message: "No best friends found yet. Start interacting with people to build your Top 8!"
      })
    }

    // Step 2: Build Top 8 with enhanced data
    const top8: Top8User[] = []
    
    for (let i = 0; i < bestFriends.length; i++) {
      const friend = bestFriends[i]
      
      // Get enhanced user data
      const userData = await fetchUserData(friend.fid)
      
      const top8User: Top8User = {
        fid: friend.fid,
        username: userData.username || friend.username || `user${friend.fid}`,
        display_name: userData.display_name || '',
        pfp_url: userData.pfp_url || '',
        bio: userData.bio || '',
        ens_name: userData.ens_name,
        mutual_affinity_score: friend.mutual_affinity_score || 0,
        rank: i + 1,
        top_friends: []
      }
      
      top8.push(top8User)
    }

    // Step 3: For each Top 8 user, get their top 3 friends
    const topFriendsPromises = top8.map(async (user) => {
      try {
        const theirBestFriends = await fetchBestFriends(user.fid, 3)
        
        const topFriends = []
        for (const friend of theirBestFriends) {
          // Skip if it's the original user to avoid circular references
          if (friend.fid === parseInt(fid)) continue
          
          const friendData = await fetchUserData(friend.fid)
          
          topFriends.push({
            fid: friend.fid,
            username: friendData.username || friend.username || `user${friend.fid}`,
            display_name: friendData.display_name || '',
            pfp_url: friendData.pfp_url || '',
            bio: friendData.bio || '',
            ens_name: friendData.ens_name,
            mutual_affinity_score: friend.mutual_affinity_score || 0,
            neynar_user_score: friendData.experimental?.neynar_user_score
          })
        }
        
        user.top_friends = topFriends.slice(0, 3)
      } catch (error) {
        console.error(`Error fetching top friends for user ${user.fid}:`, error)
        user.top_friends = []
      }
    })
    
    await Promise.all(topFriendsPromises)

    console.log(`Built Top 8 with ${top8.length} users and their top friends`)

    return NextResponse.json({
      top8,
      message: `Found your Top 8 based on mutual affinity scores`,
      stats: {
        total_users: top8.length,
        average_affinity_score: top8.reduce((sum, user) => sum + user.mutual_affinity_score, 0) / top8.length,
        top_affinity_score: top8[0]?.mutual_affinity_score || 0
      }
    })

  } catch (error) {
    console.error('Error in Top 8 API:', error)
    return NextResponse.json({ 
      error: "Failed to fetch Top 8. Please try again." 
    }, { status: 500 })
  }
} 
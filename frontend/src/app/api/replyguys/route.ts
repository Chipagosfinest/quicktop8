import { NextRequest, NextResponse } from "next/server"

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || "1E58A226-A64C-4CF3-A047-FBED94F36101"

interface ReplyGuyData {
  fid: number
  username: string
  display_name: string
  pfp_url: string
  bio: string
  ens_name?: string
  replyCount: number
  firstReplyDate: string
  lastReplyDate: string
  // Rich Neynar data
  follower_count?: number
  following_count?: number
  cast_count?: number
  verified_addresses?: string[]
  active_status?: string
  last_active?: string
  // Potential new connections
  potential_connections?: Array<{
    fid: number
    username: string
    display_name: string
    pfp_url: string
    bio: string
    ens_name?: string
    interaction_count: number
    last_interaction: string
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

// Fetch user's recent casts
async function fetchUserCasts(fid: number, limit: number = 20): Promise<any[]> {
  if (!checkRateLimit('user-casts')) {
    console.warn('Rate limit exceeded for user casts')
    return []
  }

  try {
    const response = await fetch(`https://api.neynar.com/v2/farcaster/feed/user/casts?fid=${fid}&limit=${limit}`, {
      headers: { 
        'x-api-key': NEYNAR_API_KEY, 
        'accept': 'application/json' 
      },
      signal: AbortSignal.timeout(8000)
    })
    
    if (!response.ok) {
      console.error(`Failed to fetch casts for FID ${fid}: ${response.status}`)
      return []
    }
    
    const data = await response.json()
    return data.casts || []
  } catch (error) {
    console.error(`Error fetching casts for FID ${fid}:`, error)
    return []
  }
}

// Fetch replies for a cast
async function fetchCastReplies(castHash: string): Promise<any[]> {
  if (!checkRateLimit('cast-replies')) {
    console.warn('Rate limit exceeded for cast replies')
    return []
  }

  try {
    const response = await fetch(`https://api.neynar.com/v2/farcaster/cast/conversation?identifier=${castHash}&type=hash&reply_depth=1&limit=50`, {
      headers: { 
        'x-api-key': NEYNAR_API_KEY, 
        'accept': 'application/json' 
      },
      signal: AbortSignal.timeout(8000)
    })
    
    if (!response.ok) {
      console.error(`Failed to fetch replies for cast ${castHash}: ${response.status}`)
      return []
    }
    
    const data = await response.json()
    return data.conversation?.direct_replies || []
  } catch (error) {
    console.error(`Error fetching replies for cast ${castHash}:`, error)
    return []
  }
}

// Fetch user data with caching
const userDataCache = new Map<number, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function fetchUserData(fid: number): Promise<any> {
  // Check cache first
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
        'accept': 'application/json' 
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
      // Cache the result
      userDataCache.set(fid, { data: user, timestamp: Date.now() })
      return user
    }
    
    return {}
  } catch (error) {
    console.error(`Error fetching user data for FID ${fid}:`, error)
    return {}
  }
}

// Check if user follows someone
async function checkIfFollowing(followerFid: number, followingFid: number): Promise<boolean> {
  if (!checkRateLimit('following-check')) {
    return false
  }

  try {
    const response = await fetch(`https://api.neynar.com/v2/farcaster/follows?follower=${followerFid}&following=${followingFid}`, {
      headers: { 
        'x-api-key': NEYNAR_API_KEY, 
        'accept': 'application/json' 
      },
      signal: AbortSignal.timeout(8000)
    })
    
    if (!response.ok) {
      return false
    }
    
    const data = await response.json()
    return data.follows?.length > 0
  } catch (error) {
    console.error(`Error checking following:`, error)
    return false
  }
}

// Get user's recent activity for potential connections
async function fetchUserRecentActivity(fid: number): Promise<any[]> {
  if (!checkRateLimit('user-activity')) {
    return []
  }

  try {
    const response = await fetch(`https://api.neynar.com/v2/farcaster/feed/user/replies_and_recasts?fid=${fid}&limit=10`, {
      headers: { 
        'x-api-key': NEYNAR_API_KEY, 
        'accept': 'application/json' 
      },
      signal: AbortSignal.timeout(8000)
    })
    
    if (!response.ok) {
      return []
    }
    
    const data = await response.json()
    return data.casts || []
  } catch (error) {
    console.error(`Error fetching activity for FID ${fid}:`, error)
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fid = searchParams.get('fid')

    if (!fid) {
      return NextResponse.json({ error: "FID is required" }, { status: 400 })
    }

    console.log(`Finding reply guys for FID: ${fid}`)

    // Step 1: Get user's recent casts
    const userCasts = await fetchUserCasts(parseInt(fid), 20)
    console.log(`Found ${userCasts.length} recent casts`)

    if (userCasts.length === 0) {
      return NextResponse.json({ 
        replyGuys: [],
        message: "No recent casts found. Try posting more content to discover your reply guys!"
      })
    }

    // Step 2: Get replies for each cast and find reply guys
    const replyGuysMap = new Map<number, ReplyGuyData>()
    
    // Process casts in parallel (limit to 10 for performance)
    const replyPromises = userCasts.slice(0, 10).map(async (cast: any) => {
      const replies = await fetchCastReplies(cast.hash)
      
      for (const reply of replies) {
        const replierFid = reply.author?.fid
        if (!replierFid) continue
        
        const existing = replyGuysMap.get(replierFid)
        const replyDate = new Date(reply.timestamp)
        
        if (existing) {
          existing.replyCount++
          existing.lastReplyDate = reply.timestamp
          if (replyDate < new Date(existing.firstReplyDate)) {
            existing.firstReplyDate = reply.timestamp
          }
        } else {
          // Get basic user data
          const user = await fetchUserData(replierFid)
          
          replyGuysMap.set(replierFid, {
            fid: replierFid,
            username: user.username || `user${replierFid}`,
            display_name: user.display_name || '',
            pfp_url: user.pfp_url || '',
            bio: user.bio || '',
            ens_name: user.ens_name,
            replyCount: 1,
            firstReplyDate: reply.timestamp,
            lastReplyDate: reply.timestamp,
            follower_count: user.follower_count,
            following_count: user.following_count,
            cast_count: user.cast_count,
            verified_addresses: user.verified_addresses,
            active_status: user.active_status,
            last_active: user.last_active,
            potential_connections: []
          })
        }
      }
    })
    
    await Promise.all(replyPromises)

    // Step 3: Convert to array and sort by reply count
    const replyGuys = Array.from(replyGuysMap.values())
      .sort((a, b) => b.replyCount - a.replyCount)
      .slice(0, 8)

    console.log(`Found ${replyGuys.length} reply guys`)

    if (replyGuys.length === 0) {
      return NextResponse.json({ 
        replyGuys: [],
        message: "No reply guys found yet. Keep posting engaging content to discover who replies to you most!"
      })
    }

    // Step 4: For each reply guy, find potential new connections
    const connectionPromises = replyGuys.map(async (replyGuy) => {
      // Get their recent activity
      const recentActivity = await fetchUserRecentActivity(replyGuy.fid)
      
      // Find potential new connections (people they interact with that you don't follow)
      const potentialConnections = new Map<number, any>()
      
      for (const interaction of recentActivity) {
        if (!interaction.target_fid || interaction.target_fid === parseInt(fid)) continue
        
        // Check if you already follow this person
        const alreadyFollowing = await checkIfFollowing(parseInt(fid), interaction.target_fid)
        
        if (!alreadyFollowing) {
          const existing = potentialConnections.get(interaction.target_fid)
          if (existing) {
            existing.interaction_count++
            if (new Date(interaction.timestamp) > new Date(existing.last_interaction)) {
              existing.last_interaction = interaction.timestamp
            }
          } else {
            // Get basic info about this potential connection
            const user = await fetchUserData(interaction.target_fid)
            
            potentialConnections.set(interaction.target_fid, {
              fid: interaction.target_fid,
              username: user.username || `user${interaction.target_fid}`,
              display_name: user.display_name || '',
              pfp_url: user.pfp_url || '',
              bio: user.bio || '',
              ens_name: user.ens_name,
              interaction_count: 1,
              last_interaction: interaction.timestamp
            })
          }
        }
      }
      
      replyGuy.potential_connections = Array.from(potentialConnections.values())
        .sort((a, b) => b.interaction_count - a.interaction_count)
        .slice(0, 5)
    })
    
    await Promise.all(connectionPromises)

    return NextResponse.json({
      replyGuys,
      message: `Found ${replyGuys.length} reply guys with potential new connections`
    })

  } catch (error) {
    console.error('Error in reply guys API:', error)
    return NextResponse.json({ 
      error: "Failed to fetch reply guys. Please try again." 
    }, { status: 500 })
  }
} 
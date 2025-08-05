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
  // Their recent interactions with others
  recent_interactions?: Array<{
    target_username: string
    target_fid: number
    interaction_type: 'reply' | 'like' | 'recast'
    cast_text: string
    timestamp: string
  }>
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

// Rate limiting helper
const rateLimiter = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 50 // requests per minute
const RATE_WINDOW = 60000 // 1 minute in milliseconds

function checkRateLimit(endpoint: string): boolean {
  const now = Date.now()
  const key = `${endpoint}:${Math.floor(now / RATE_WINDOW)}`
  const current = rateLimiter.get(key) || { count: 0, resetTime: now + RATE_WINDOW }
  
  if (now > current.resetTime) {
    rateLimiter.set(key, { count: 1, resetTime: now + RATE_WINDOW })
    return true
  }
  
  if (current.count >= RATE_LIMIT) {
    return false
  }
  
  current.count++
  rateLimiter.set(key, current)
  return true
}

// Optimized function to fetch user's recent casts with better error handling
async function fetchUserCasts(fid: number, limit: number = 15): Promise<any[]> {
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
      signal: AbortSignal.timeout(10000) // Increased timeout for reliability
    })
    
    if (!response.ok) {
      console.error(`Failed to fetch casts for FID ${fid}: ${response.status} ${response.statusText}`)
      return []
    }
    
    const data = await response.json()
    return data.casts || []
  } catch (error) {
    console.error(`Error fetching casts for FID ${fid}:`, error)
    return []
  }
}

// Optimized function to fetch replies for a cast using conversation endpoint
async function fetchCastReplies(castHash: string): Promise<any[]> {
  if (!checkRateLimit('cast-replies')) {
    console.warn('Rate limit exceeded for cast replies')
    return []
  }

  try {
    // Using conversation endpoint with optimized parameters
    const response = await fetch(`https://api.neynar.com/v2/farcaster/cast/conversation?identifier=${castHash}&type=hash&reply_depth=1&limit=25`, {
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
    const conversation = data.conversation || {}
    return conversation.direct_replies || []
  } catch (error) {
    console.error(`Error fetching replies for cast ${castHash}:`, error)
    return []
  }
}

// Optimized function to fetch user's recent activity with parallel processing
async function fetchUserRecentActivity(fid: number): Promise<any[]> {
  if (!checkRateLimit('user-activity')) {
    console.warn('Rate limit exceeded for user activity')
    return []
  }

  try {
    const response = await fetch(`https://api.neynar.com/v2/farcaster/feed/user/casts?fid=${fid}&limit=8`, {
      headers: { 
        'x-api-key': NEYNAR_API_KEY, 
        'accept': 'application/json' 
      },
      signal: AbortSignal.timeout(8000)
    })
    
    if (!response.ok) {
      console.error(`Failed to fetch user activity for FID ${fid}: ${response.status}`)
      return []
    }
    
    const data = await response.json()
    const casts = data.casts || []
    const interactions: any[] = []
    
    // Process casts in parallel for better performance
    const activityPromises = casts.slice(0, 4).map(async (cast: any) => {
      const castInteractions: any[] = []
      
      try {
        // Get reactions in parallel
        const reactionsPromise = fetch(`https://api.neynar.com/v2/farcaster/cast/reactions?identifier=${cast.hash}&type=hash&limit=50`, {
          headers: { 'x-api-key': NEYNAR_API_KEY, 'accept': 'application/json' },
          signal: AbortSignal.timeout(5000)
        })
        
        // Get replies in parallel
        const repliesPromise = fetchCastReplies(cast.hash)
        
        // Wait for both requests
        const [reactionsResponse, replies] = await Promise.all([reactionsPromise, repliesPromise])
        
        if (reactionsResponse.ok) {
          const reactionsData = await reactionsResponse.json()
          const reactions = reactionsData.reactions || []
          
          for (const reaction of reactions) {
            if (reaction.reactor_user?.fid !== fid) {
              castInteractions.push({
                target_fid: reaction.reactor_user?.fid,
                target_username: reaction.reactor_user?.username,
                interaction_type: reaction.reaction_type,
                cast_text: cast.text,
                timestamp: cast.timestamp
              })
            }
          }
        }
        
        // Add replies
        for (const reply of replies) {
          if (reply.author?.fid !== fid) {
            castInteractions.push({
              target_fid: reply.author?.fid,
              target_username: reply.author?.username,
              interaction_type: 'reply',
              cast_text: reply.text,
              timestamp: reply.timestamp
            })
          }
        }
      } catch (error) {
        console.error(`Error processing cast ${cast.hash}:`, error)
      }
      
      return castInteractions
    })
    
    const results = await Promise.all(activityPromises)
    return results.flat()
  } catch (error) {
    console.error(`Error fetching recent activity for FID ${fid}:`, error)
    return []
  }
}

// Optimized function to check if user follows someone using followers endpoint
async function checkIfFollowing(followerFid: number, followingFid: number): Promise<boolean> {
  if (!checkRateLimit('followers-check')) {
    console.warn('Rate limit exceeded for followers check')
    return false
  }

  try {
    // Use followers endpoint with optimized parameters
    const response = await fetch(`https://api.neynar.com/v2/farcaster/followers?fid=${followingFid}&limit=1000`, {
      headers: { 
        'x-api-key': NEYNAR_API_KEY, 
        'accept': 'application/json' 
      },
      signal: AbortSignal.timeout(8000)
    })
    
    if (!response.ok) {
      console.error(`Failed to check followers for FID ${followingFid}: ${response.status}`)
      return false
    }
    
    const data = await response.json()
    const followers = data.users || []
    return followers.some((user: any) => user.user.fid === followerFid)
  } catch (error) {
    console.error(`Error checking if ${followerFid} follows ${followingFid}:`, error)
    return false
  }
}

// Optimized function to fetch user data with caching
const userDataCache = new Map<number, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

async function fetchUserData(fid: number): Promise<any> {
  const now = Date.now()
  const cached = userDataCache.get(fid)
  
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data
  }

  if (!checkRateLimit('user-data')) {
    console.warn('Rate limit exceeded for user data')
    return {}
  }

  try {
    const response = await fetch(`https://api.neynar.com/v2/farcaster/user?fid=${fid}`, {
      headers: { 
        'x-api-key': NEYNAR_API_KEY, 
        'accept': 'application/json' 
      },
      signal: AbortSignal.timeout(5000)
    })
    
    if (!response.ok) {
      console.error(`Failed to fetch user data for FID ${fid}: ${response.status}`)
      return {}
    }
    
    const data = await response.json()
    const userData = data.user || {}
    
    // Cache the result
    userDataCache.set(fid, { data: userData, timestamp: now })
    
    return userData
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

    console.log(`Finding reply guys for FID: ${fid}`)

    // Step 1: Get user's recent casts with optimized limit
    const userCasts = await fetchUserCasts(parseInt(fid), 12)
    console.log(`Found ${userCasts.length} recent casts`)

    if (userCasts.length === 0) {
      return NextResponse.json({ 
        replyGuys: [],
        message: "No recent casts found to analyze replies."
      })
    }

    // Step 2: Get replies for each cast and find reply guys with parallel processing
    const replyGuysMap = new Map<number, ReplyGuyData>()
    
    // Process casts in parallel for better performance
    const replyPromises = userCasts.slice(0, 8).map(async (cast: any) => {
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
          // Get basic user data with caching
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
            recent_interactions: [],
            potential_connections: []
          })
        }
      }
    })
    
    await Promise.all(replyPromises)

    // Step 3: Convert to array and sort by reply count
    const replyGuys = Array.from(replyGuysMap.values())
      .sort((a, b) => b.replyCount - a.replyCount)
      .slice(0, 6) // Reduced to 6 for better performance

    console.log(`Found ${replyGuys.length} reply guys`)

    // Step 4: For each reply guy, find their recent interactions and potential connections
    const connectionPromises = replyGuys.map(async (replyGuy) => {
      // Get their recent activity
      const recentActivity = await fetchUserRecentActivity(replyGuy.fid)
      replyGuy.recent_interactions = recentActivity.slice(0, 8)
      
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
            // Get basic info about this potential connection with caching
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
        .slice(0, 4) // Reduced to 4 for better performance
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
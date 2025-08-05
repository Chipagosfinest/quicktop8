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

// Enhanced debugging function to fetch user's recent casts
async function fetchUserCasts(fid: number, limit: number = 15): Promise<any[]> {
  if (!checkRateLimit('user-casts')) {
    console.warn('Rate limit exceeded for user casts')
    return []
  }

  try {
    console.log(`🔍 Fetching casts for FID: ${fid} with limit: ${limit}`)
    
    const url = `https://api.neynar.com/v2/farcaster/feed/user/casts?fid=${fid}&limit=${limit}`
    console.log(`📡 API URL: ${url}`)
    
    const response = await fetch(url, {
      headers: { 
        'x-api-key': NEYNAR_API_KEY, 
        'accept': 'application/json' 
      },
      signal: AbortSignal.timeout(10000)
    })
    
    console.log(`📊 Response status: ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Failed to fetch casts for FID ${fid}: ${response.status} ${response.statusText}`)
      console.error(`❌ Error details: ${errorText}`)
      return []
    }
    
    const data = await response.json()
    console.log(`✅ Casts response structure:`, Object.keys(data))
    console.log(`📝 Found ${data.casts?.length || 0} casts`)
    
    if (data.casts && data.casts.length > 0) {
      console.log(`📝 First cast:`, {
        hash: data.casts[0].hash,
        text: data.casts[0].text?.substring(0, 50) + '...',
        timestamp: data.casts[0].timestamp
      })
    }
    
    return data.casts || []
  } catch (error) {
    console.error(`💥 Error fetching casts for FID ${fid}:`, error)
    return []
  }
}

// Enhanced debugging function to fetch replies for a cast
async function fetchCastReplies(castHash: string): Promise<any[]> {
  if (!checkRateLimit('cast-replies')) {
    console.warn('Rate limit exceeded for cast replies')
    return []
  }

  try {
    console.log(`🔍 Fetching replies for cast: ${castHash}`)
    
    const url = `https://api.neynar.com/v2/farcaster/feed/conversation_and_replies?identifier=${castHash}&reply_depth=1&limit=25`
    console.log(`📡 API URL: ${url}`)
    
    const response = await fetch(url, {
      headers: { 
        'x-api-key': NEYNAR_API_KEY, 
        'accept': 'application/json' 
      },
      signal: AbortSignal.timeout(10000)
    })
    
    console.log(`📊 Replies response status: ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Failed to fetch replies for cast ${castHash}: ${response.status} ${response.statusText}`)
      console.error(`❌ Error details: ${errorText}`)
      return []
    }
    
    const data = await response.json()
    console.log(`✅ Replies response structure:`, Object.keys(data))
    
    // Filter out the original cast and get only replies
    const replies = data.conversation?.direct_replies || []
    console.log(`📝 Found ${replies.length} replies`)
    
    if (replies.length > 0) {
      console.log(`📝 First reply:`, {
        author: replies[0].author?.username,
        text: replies[0].text?.substring(0, 50) + '...',
        timestamp: replies[0].timestamp
      })
    }
    
    return replies
  } catch (error) {
    console.error(`💥 Error fetching replies for cast ${castHash}:`, error)
    return []
  }
}

// Enhanced debugging function to fetch user's recent activity
async function fetchUserRecentActivity(fid: number): Promise<any[]> {
  if (!checkRateLimit('user-activity')) {
    console.warn('Rate limit exceeded for user activity')
    return []
  }

  try {
    console.log(`🔍 Fetching recent activity for FID: ${fid}`)
    
    const url = `https://api.neynar.com/v2/farcaster/feed/user/replies_and_recasts?fid=${fid}&limit=8`
    console.log(`📡 API URL: ${url}`)
    
    const response = await fetch(url, {
      headers: { 
        'x-api-key': NEYNAR_API_KEY, 
        'accept': 'application/json' 
      },
      signal: AbortSignal.timeout(10000)
    })
    
    console.log(`📊 Activity response status: ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Failed to fetch activity for FID ${fid}: ${response.status} ${response.statusText}`)
      console.error(`❌ Error details: ${errorText}`)
      return []
    }
    
    const data = await response.json()
    console.log(`✅ Activity response structure:`, Object.keys(data))
    console.log(`📝 Found ${data.casts?.length || 0} activities`)
    
    return data.casts || []
  } catch (error) {
    console.error(`💥 Error fetching activity for FID ${fid}:`, error)
    return []
  }
}

// Enhanced debugging function to check if following
async function checkIfFollowing(followerFid: number, followingFid: number): Promise<boolean> {
  if (!checkRateLimit('following-check')) {
    console.warn('Rate limit exceeded for following check')
    return false
  }

  try {
    console.log(`🔍 Checking if ${followerFid} follows ${followingFid}`)
    
    const url = `https://api.neynar.com/v2/farcaster/follows?follower=${followerFid}&following=${followingFid}`
    console.log(`📡 API URL: ${url}`)
    
    const response = await fetch(url, {
      headers: { 
        'x-api-key': NEYNAR_API_KEY, 
        'accept': 'application/json' 
      },
      signal: AbortSignal.timeout(10000)
    })
    
    console.log(`📊 Following check response status: ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      console.error(`❌ Failed to check following: ${response.status} ${response.statusText}`)
      return false
    }
    
    const data = await response.json()
    const isFollowing = data.follows?.length > 0
    console.log(`✅ Following check result: ${isFollowing}`)
    
    return isFollowing
  } catch (error) {
    console.error(`💥 Error checking following:`, error)
    return false
  }
}

// Enhanced debugging function to fetch user data with caching
const userDataCache = new Map<number, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function fetchUserData(fid: number): Promise<any> {
  if (!checkRateLimit('user-data')) {
    console.warn('Rate limit exceeded for user data')
    return {}
  }

  // Check cache first
  const cached = userDataCache.get(fid)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`📋 Using cached data for FID: ${fid}`)
    return cached.data
  }

  try {
    console.log(`🔍 Fetching user data for FID: ${fid}`)
    
    const url = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`
    console.log(`📡 API URL: ${url}`)
    
    const response = await fetch(url, {
      headers: { 
        'x-api-key': NEYNAR_API_KEY, 
        'accept': 'application/json' 
      },
      signal: AbortSignal.timeout(10000)
    })
    
    console.log(`📊 User data response status: ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Failed to fetch user data for FID ${fid}: ${response.status} ${response.statusText}`)
      console.error(`❌ Error details: ${errorText}`)
      return {}
    }
    
    const data = await response.json()
    console.log(`✅ User data response structure:`, Object.keys(data))
    
    const user = data.users?.[0]
    if (user) {
      console.log(`📝 User data:`, {
        username: user.username,
        display_name: user.display_name,
        follower_count: user.follower_count
      })
      
      // Cache the result
      userDataCache.set(fid, { data: user, timestamp: Date.now() })
      return user
    } else {
      console.warn(`⚠️ No user data found for FID: ${fid}`)
      return {}
    }
  } catch (error) {
    console.error(`💥 Error fetching user data for FID ${fid}:`, error)
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

    console.log(`🚀 Starting reply guys analysis for FID: ${fid}`)
    console.log(`🔑 Using API key: ${NEYNAR_API_KEY.substring(0, 8)}...`)

    // Step 1: Get user's recent casts with enhanced debugging
    const userCasts = await fetchUserCasts(parseInt(fid), 12)
    console.log(`📊 Found ${userCasts.length} recent casts`)

    if (userCasts.length === 0) {
      console.log(`⚠️ No recent casts found for FID: ${fid}`)
      return NextResponse.json({ 
        replyGuys: [],
        message: "No recent casts found to analyze replies. Try posting more content!",
        debug: {
          fid: parseInt(fid),
          castsFound: 0,
          apiKeyUsed: NEYNAR_API_KEY.substring(0, 8) + '...'
        }
      })
    }

    // Step 2: Get replies for each cast and find reply guys with parallel processing
    const replyGuysMap = new Map<number, ReplyGuyData>()
    
    console.log(`🔄 Processing ${userCasts.length} casts for replies...`)
    
    // Process casts in parallel for better performance
    const replyPromises = userCasts.slice(0, 8).map(async (cast: any, index: number) => {
      console.log(`📝 Processing cast ${index + 1}/${userCasts.length}: ${cast.hash}`)
      const replies = await fetchCastReplies(cast.hash)
      
      console.log(`📝 Found ${replies.length} replies for cast ${index + 1}`)
      
      for (const reply of replies) {
        const replierFid = reply.author?.fid
        if (!replierFid) {
          console.warn(`⚠️ Reply missing author FID:`, reply)
          continue
        }
        
        console.log(`👤 Processing reply from FID: ${replierFid}`)
        
        const existing = replyGuysMap.get(replierFid)
        const replyDate = new Date(reply.timestamp)
        
        if (existing) {
          existing.replyCount++
          existing.lastReplyDate = reply.timestamp
          if (replyDate < new Date(existing.firstReplyDate)) {
            existing.firstReplyDate = reply.timestamp
          }
          console.log(`📈 Updated reply count for FID ${replierFid}: ${existing.replyCount}`)
        } else {
          console.log(`🆕 New reply guy found: FID ${replierFid}`)
          
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

    console.log(`🎉 Found ${replyGuys.length} reply guys total`)

    if (replyGuys.length === 0) {
      console.log(`⚠️ No reply guys found after processing`)
      return NextResponse.json({ 
        replyGuys: [],
        message: "No reply guys found. Start posting more content to discover who replies to you most!",
        debug: {
          fid: parseInt(fid),
          castsProcessed: userCasts.length,
          replyGuysFound: 0,
          apiKeyUsed: NEYNAR_API_KEY.substring(0, 8) + '...'
        }
      })
    }

    // Step 4: For each reply guy, find their recent interactions and potential connections
    console.log(`🔗 Finding potential connections for ${replyGuys.length} reply guys...`)
    
    const connectionPromises = replyGuys.map(async (replyGuy, index) => {
      console.log(`🔍 Processing reply guy ${index + 1}/${replyGuys.length}: ${replyGuy.username}`)
      
      // Get their recent activity
      const recentActivity = await fetchUserRecentActivity(replyGuy.fid)
      replyGuy.recent_interactions = recentActivity.slice(0, 8)
      
      console.log(`📝 Found ${recentActivity.length} recent activities for ${replyGuy.username}`)
      
      // Find potential new connections (people they interact with that you don't follow)
      const potentialConnections = new Map<number, any>()
      
      for (const interaction of recentActivity) {
        if (!interaction.target_fid || interaction.target_fid === parseInt(fid)) continue
        
        console.log(`🔍 Checking potential connection: FID ${interaction.target_fid}`)
        
        // Check if you already follow this person
        const alreadyFollowing = await checkIfFollowing(parseInt(fid), interaction.target_fid)
        
        if (!alreadyFollowing) {
          console.log(`✨ New potential connection found: FID ${interaction.target_fid}`)
          
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
      
      console.log(`🔗 Found ${replyGuy.potential_connections.length} potential connections for ${replyGuy.username}`)
    })
    
    await Promise.all(connectionPromises)

    console.log(`✅ Reply guys analysis complete!`)
    console.log(`📊 Final results:`, {
      totalReplyGuys: replyGuys.length,
      replyGuysWithConnections: replyGuys.filter(rg => (rg.potential_connections?.length || 0) > 0).length,
      totalPotentialConnections: replyGuys.reduce((sum, rg) => sum + (rg.potential_connections?.length || 0), 0)
    })

    return NextResponse.json({
      replyGuys,
      message: `Found ${replyGuys.length} reply guys with potential new connections`,
      debug: {
        fid: parseInt(fid),
        castsProcessed: userCasts.length,
        replyGuysFound: replyGuys.length,
        apiKeyUsed: NEYNAR_API_KEY.substring(0, 8) + '...'
      }
    })

  } catch (error) {
    console.error('💥 Error in reply guys API:', error)
    return NextResponse.json({ 
      error: "Failed to fetch reply guys. Please try again.",
      debug: {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 })
  }
} 
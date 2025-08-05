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

// Function to fetch user's recent casts
async function fetchUserCasts(fid: number, limit: number = 20): Promise<any[]> {
  try {
    const response = await fetch(`https://api.neynar.com/v2/farcaster/feed/user/casts?fid=${fid}&limit=${limit}`, {
      headers: { 'x-api-key': NEYNAR_API_KEY, 'accept': 'application/json' },
      signal: AbortSignal.timeout(8000)
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.casts || []
    }
  } catch (error) {
    console.error(`Error fetching casts for FID ${fid}:`, error)
  }
  return []
}

// Function to fetch replies for a cast
async function fetchCastReplies(castHash: string): Promise<any[]> {
  try {
    const response = await fetch(`https://api.neynar.com/v2/farcaster/cast/conversation?identifier=${castHash}&type=hash&reply_depth=1&limit=50`, {
      headers: { 'x-api-key': NEYNAR_API_KEY, 'accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    })
    
    if (response.ok) {
      const data = await response.json()
      const conversation = data.conversation || {}
      return conversation.direct_replies || []
    }
  } catch (error) {
    console.error(`Error fetching replies for cast ${castHash}:`, error)
  }
  return []
}

// Function to fetch user's recent activity (who they interact with)
async function fetchUserRecentActivity(fid: number): Promise<any[]> {
  try {
    const response = await fetch(`https://api.neynar.com/v2/farcaster/feed/user/casts?fid=${fid}&limit=10`, {
      headers: { 'x-api-key': NEYNAR_API_KEY, 'accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    })
    
    if (response.ok) {
      const data = await response.json()
      const casts = data.casts || []
      const interactions: any[] = []
      
      // For each cast, get reactions and replies
      for (const cast of casts.slice(0, 5)) {
        // Get reactions
        const reactionsResponse = await fetch(`https://api.neynar.com/v2/farcaster/cast/reactions?identifier=${cast.hash}&type=hash&limit=100`, {
          headers: { 'x-api-key': NEYNAR_API_KEY, 'accept': 'application/json' },
          signal: AbortSignal.timeout(3000)
        })
        
        if (reactionsResponse.ok) {
          const reactionsData = await reactionsResponse.json()
          const reactions = reactionsData.reactions || []
          
          for (const reaction of reactions) {
            if (reaction.reactor_user?.fid !== fid) {
              interactions.push({
                target_fid: reaction.reactor_user?.fid,
                target_username: reaction.reactor_user?.username,
                interaction_type: reaction.reaction_type,
                cast_text: cast.text,
                timestamp: cast.timestamp
              })
            }
          }
        }
        
        // Get replies
        const replies = await fetchCastReplies(cast.hash)
        for (const reply of replies) {
          if (reply.author?.fid !== fid) {
            interactions.push({
              target_fid: reply.author?.fid,
              target_username: reply.author?.username,
              interaction_type: 'reply',
              cast_text: reply.text,
              timestamp: reply.timestamp
            })
          }
        }
      }
      
      return interactions
    }
  } catch (error) {
    console.error(`Error fetching recent activity for FID ${fid}:`, error)
  }
  return []
}

// Function to check if user follows someone
async function checkIfFollowing(followerFid: number, followingFid: number): Promise<boolean> {
  try {
    const response = await fetch(`https://api.neynar.com/v2/farcaster/followers?fid=${followingFid}&limit=1000`, {
      headers: { 'x-api-key': NEYNAR_API_KEY, 'accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    })
    
    if (response.ok) {
      const data = await response.json()
      const followers = data.users || []
      return followers.some((user: any) => user.user.fid === followerFid)
    }
  } catch (error) {
    console.error(`Error checking if ${followerFid} follows ${followingFid}:`, error)
  }
  return false
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
    const userCasts = await fetchUserCasts(parseInt(fid), 15)
    console.log(`Found ${userCasts.length} recent casts`)

    if (userCasts.length === 0) {
      return NextResponse.json({ 
        replyGuys: [],
        message: "No recent casts found to analyze replies."
      })
    }

    // Step 2: Get replies for each cast and find reply guys
    const replyGuysMap = new Map<number, ReplyGuyData>()
    
    for (const cast of userCasts.slice(0, 10)) {
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
          const userResponse = await fetch(`https://api.neynar.com/v2/farcaster/user?fid=${replierFid}`, {
            headers: { 'x-api-key': NEYNAR_API_KEY, 'accept': 'application/json' },
            signal: AbortSignal.timeout(3000)
          })
          
          if (userResponse.ok) {
            const userData = await userResponse.json()
            const user = userData.user || {}
            
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
      }
    }

    // Step 3: Convert to array and sort by reply count
    const replyGuys = Array.from(replyGuysMap.values())
      .sort((a, b) => b.replyCount - a.replyCount)
      .slice(0, 8)

    console.log(`Found ${replyGuys.length} reply guys`)

    // Step 4: For each reply guy, find their recent interactions and potential connections
    for (const replyGuy of replyGuys) {
      // Get their recent activity
      const recentActivity = await fetchUserRecentActivity(replyGuy.fid)
      replyGuy.recent_interactions = recentActivity.slice(0, 10)
      
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
            const userResponse = await fetch(`https://api.neynar.com/v2/farcaster/user?fid=${interaction.target_fid}`, {
              headers: { 'x-api-key': NEYNAR_API_KEY, 'accept': 'application/json' },
              signal: AbortSignal.timeout(3000)
            })
            
            if (userResponse.ok) {
              const userData = await userResponse.json()
              const user = userData.user || {}
              
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
      }
      
      replyGuy.potential_connections = Array.from(potentialConnections.values())
        .sort((a, b) => b.interaction_count - a.interaction_count)
        .slice(0, 5)
    }

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
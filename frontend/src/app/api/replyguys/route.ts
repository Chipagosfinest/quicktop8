import { NextRequest, NextResponse } from "next/server"

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || "1E58A226-A64C-4CF3-A047-FBED94F36101"

interface StreamerData {
  fid: number
  username: string
  display_name: string
  pfp_url: string
  bio: string
  totalInteractions: number
  lastInteraction: string
  originalEngagementCastUrl: string
}

export async function POST(request: NextRequest) {
  try {
    const { fid } = await request.json()

    if (!fid) {
      return NextResponse.json({ error: "FID is required" }, { status: 400 })
    }

    console.log(`Starting Top 8 Streamers calculation for FID: ${fid}`)

    const streamersMap = new Map<number, StreamerData>()
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
    
    // Get user's recent activity (likes, recasts, replies) from the last 30 days
    const userActivityResponse = await fetch(`https://api.neynar.com/v2/farcaster/feed/user/casts?fid=${fid}&limit=100`, {
      headers: {
        'x-api-key': NEYNAR_API_KEY,
        'accept': 'application/json'
      },
      signal: AbortSignal.timeout(15000)
    })
    
    if (!userActivityResponse.ok) {
      console.error(`Failed to fetch user activity: ${userActivityResponse.status}`)
      return NextResponse.json({ 
        error: "Failed to fetch activity. Please try again." 
      }, { status: 500 })
    }
    
    const userActivityData = await userActivityResponse.json()
    const userCasts = userActivityData.casts || []
    console.log(`Found ${userCasts.length} recent casts`)
    
    if (userCasts.length === 0) {
      return NextResponse.json({ 
        friends: [],
        message: "No recent activity found. Try posting more to see your top streamers!"
      })
    }
    
    // Process each cast to find interactions
    for (const cast of userCasts) {
      try {
        // Check if cast is within last 30 days
        const castTimestamp = new Date(cast.timestamp).getTime()
        if (castTimestamp < thirtyDaysAgo) continue
        
        // Get cast reactions (likes, recasts)
        const reactionsResponse = await fetch(`https://api.neynar.com/v2/farcaster/cast/reactions?identifier=${cast.hash}&type=hash`, {
          headers: {
            'x-api-key': NEYNAR_API_KEY,
            'accept': 'application/json'
          },
          signal: AbortSignal.timeout(5000)
        })
        
        if (reactionsResponse.ok) {
          const reactionsData = await reactionsResponse.json()
          const reactions = reactionsData.reactions || []
          
          // Process each reaction
          for (const reaction of reactions) {
            const reactor = reaction.reactor_user
            
            // Skip self-reactions
            if (reactor.fid === parseInt(fid)) continue
            
            const existing = streamersMap.get(reactor.fid)
            
            if (existing) {
              existing.totalInteractions++
              // Update last interaction if this is more recent
              if (new Date(reaction.timestamp) > new Date(existing.lastInteraction)) {
                existing.lastInteraction = reaction.timestamp
                existing.originalEngagementCastUrl = `https://warpcast.com/~/conversations/${cast.hash}`
              }
            } else {
              // New streamer
              const newStreamer: StreamerData = {
                fid: reactor.fid,
                username: reactor.username,
                display_name: reactor.display_name,
                pfp_url: reactor.pfp_url,
                bio: reactor.profile?.bio?.text || "",
                totalInteractions: 1,
                lastInteraction: reaction.timestamp,
                originalEngagementCastUrl: `https://warpcast.com/~/conversations/${cast.hash}`
              }
              streamersMap.set(reactor.fid, newStreamer)
            }
          }
        }
        
        // Get cast replies
        const conversationResponse = await fetch(`https://api.neynar.com/v2/farcaster/cast/conversation?identifier=${cast.hash}&type=hash&reply_depth=1&limit=25`, {
          headers: {
            'x-api-key': NEYNAR_API_KEY,
            'accept': 'application/json'
          },
          signal: AbortSignal.timeout(5000)
        })
        
        if (conversationResponse.ok) {
          const conversationData = await conversationResponse.json()
          const conversation = conversationData.conversation || {}
          const directReplies = conversation.direct_replies || []
          
          // Process each reply
          for (const reply of directReplies) {
            const replyAuthor = reply.author
            
            // Skip self-replies
            if (replyAuthor.fid === parseInt(fid)) continue
            
            const existing = streamersMap.get(replyAuthor.fid)
            
            if (existing) {
              existing.totalInteractions++
              // Update last interaction if this is more recent
              if (new Date(reply.timestamp) > new Date(existing.lastInteraction)) {
                existing.lastInteraction = reply.timestamp
                existing.originalEngagementCastUrl = `https://warpcast.com/~/conversations/${cast.hash}`
              }
            } else {
              // New streamer
              const newStreamer: StreamerData = {
                fid: replyAuthor.fid,
                username: replyAuthor.username,
                display_name: replyAuthor.display_name,
                pfp_url: replyAuthor.pfp_url,
                bio: replyAuthor.profile?.bio?.text || "",
                totalInteractions: 1,
                lastInteraction: reply.timestamp,
                originalEngagementCastUrl: `https://warpcast.com/~/conversations/${cast.hash}`
              }
              streamersMap.set(replyAuthor.fid, newStreamer)
            }
          }
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50))
        
      } catch (error) {
        console.error(`Error processing cast ${cast.hash}:`, error)
        continue
      }
    }
    
    // Sort by interaction count and return top 8
    const friends = Array.from(streamersMap.values())
      .sort((a, b) => b.totalInteractions - a.totalInteractions)
      .slice(0, 8)
      .map(friend => ({
        fid: friend.fid,
        username: friend.username,
        display_name: friend.display_name,
        pfp_url: friend.pfp_url,
        bio: friend.bio,
        totalInteractions: friend.totalInteractions,
        lastInteraction: friend.lastInteraction,
        originalEngagementCastUrl: friend.originalEngagementCastUrl,
        // For backward compatibility with frontend
        rideOrDieScore: friend.totalInteractions,
        daysSinceFirstEngagement: Math.round((Date.now() - new Date(friend.lastInteraction).getTime()) / (1000 * 60 * 60 * 24)),
        engagementFrequency: friend.totalInteractions / 30
      }))
    
    console.log(`Found ${friends.length} top streamers`)
    
    if (friends.length === 0) {
      return NextResponse.json({ 
        friends: [],
        message: "No streamers found! Try posting more content to attract interactions."
      })
    }
    
    return NextResponse.json({ friends })
    
  } catch (error) {
    console.error('Error in reply guys calculation:', error)
    return NextResponse.json({ 
      error: "Failed to calculate reply guys. Please try again." 
    }, { status: 500 })
  }
}
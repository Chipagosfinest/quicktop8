import { NextRequest, NextResponse } from "next/server"

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || "1E58A226-A64C-4CF3-A047-FBED94F36101"

interface ReplyGuyData {
  fid: number
  username: string
  display_name: string
  pfp_url: string
  bio: string
  followDate: string
  firstEngagement: string
  engagementType: 'reply'
  totalInteractions: number
  relationshipScore: number
  originalEngagementCastHash: string
  originalEngagementCastUrl: string
  rideOrDieScore: number
  daysSinceFirstEngagement: number
  engagementFrequency: number
}

export async function POST(request: NextRequest) {
  try {
    const { fid } = await request.json()

    if (!fid) {
      return NextResponse.json({ error: "FID is required" }, { status: 400 })
    }

    console.log(`Starting Reply Guys Top 8 calculation for FID: ${fid}`)

    const replyGuysMap = new Map<number, ReplyGuyData>()
    
    // Get user's recent casts and check replies
    const userCastsResponse = await fetch(`https://api.neynar.com/v2/farcaster/feed/user/casts?fid=${fid}&limit=25`, {
      headers: {
        'x-api-key': NEYNAR_API_KEY,
        'accept': 'application/json'
      },
      signal: AbortSignal.timeout(15000)
    })
    
    if (!userCastsResponse.ok) {
      console.error(`Failed to fetch user casts: ${userCastsResponse.status}`)
      return NextResponse.json({ 
        error: "Failed to fetch casts. Please try again." 
      }, { status: 500 })
    }
    
    const userCastsData = await userCastsResponse.json()
    const userCasts = userCastsData.casts || []
    console.log(`Found ${userCasts.length} recent casts`)
    
    if (userCasts.length === 0) {
      return NextResponse.json({ 
        friends: [],
        message: "No recent casts found. Try posting more to see your reply guys!"
      })
    }
    
    // Process each cast to find replies
    for (const cast of userCasts.slice(0, 15)) {
      try {
        // Get cast conversations (replies)
        const conversationResponse = await fetch(`https://api.neynar.com/v2/farcaster/cast/conversation?identifier=${cast.hash}&type=hash&reply_depth=1&limit=25`, {
          headers: {
            'x-api-key': NEYNAR_API_KEY,
            'accept': 'application/json'
          },
          signal: AbortSignal.timeout(8000)
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
            
            const existing = replyGuysMap.get(replyAuthor.fid)
            const replyTimestamp = reply.timestamp
            
            if (existing) {
              existing.totalInteractions++
              // Update first engagement if this is earlier
              if (new Date(replyTimestamp) < new Date(existing.firstEngagement)) {
                existing.firstEngagement = replyTimestamp
                existing.originalEngagementCastHash = cast.hash
                existing.originalEngagementCastUrl = `https://warpcast.com/~/conversations/${cast.hash}`
              }
            } else {
              // New reply guy
              const newReplyGuy: ReplyGuyData = {
                fid: replyAuthor.fid,
                username: replyAuthor.username,
                display_name: replyAuthor.display_name,
                pfp_url: replyAuthor.pfp_url,
                bio: replyAuthor.profile?.bio?.text || "",
                followDate: replyTimestamp, // Use first reply as "follow" date
                firstEngagement: replyTimestamp,
                engagementType: 'reply',
                totalInteractions: 1,
                relationshipScore: 0,
                originalEngagementCastHash: cast.hash,
                originalEngagementCastUrl: `https://warpcast.com/~/conversations/${cast.hash}`,
                rideOrDieScore: 0,
                daysSinceFirstEngagement: 0,
                engagementFrequency: 0
              }
              replyGuysMap.set(replyAuthor.fid, newReplyGuy)
            }
          }
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.error(`Error processing cast ${cast.hash}:`, error)
        continue
      }
    }
    
    // Calculate scores for all reply guys
    const now = Date.now()
    for (const replyGuy of replyGuysMap.values()) {
      const firstEngagementDate = new Date(replyGuy.firstEngagement)
      replyGuy.daysSinceFirstEngagement = (now - firstEngagementDate.getTime()) / (1000 * 60 * 60 * 24)
      replyGuy.engagementFrequency = replyGuy.totalInteractions / Math.max(replyGuy.daysSinceFirstEngagement, 1)
      
      // Reply Guy score: heavily weighted on reply frequency
      replyGuy.rideOrDieScore = Math.round(
        (replyGuy.totalInteractions * 10) + // Reply count is most important
        (replyGuy.engagementFrequency * 50) + // Frequency bonus
        (Math.min(replyGuy.daysSinceFirstEngagement, 30) * 2) // Consistency bonus (capped at 30 days)
      )
      
      replyGuy.relationshipScore = replyGuy.rideOrDieScore
    }
    
    // Sort by reply count and return top 8
    const friends = Array.from(replyGuysMap.values())
      .sort((a, b) => b.totalInteractions - a.totalInteractions)
      .slice(0, 8)
      .map(friend => ({
        fid: friend.fid,
        username: friend.username,
        display_name: friend.display_name,
        pfp_url: friend.pfp_url,
        bio: friend.bio,
        followDate: friend.followDate,
        firstEngagement: friend.firstEngagement,
        engagementType: friend.engagementType,
        totalInteractions: friend.totalInteractions,
        relationshipScore: Math.round(friend.relationshipScore),
        originalEngagementCastHash: friend.originalEngagementCastHash,
        originalEngagementCastUrl: friend.originalEngagementCastUrl,
        rideOrDieScore: friend.rideOrDieScore,
        daysSinceFirstEngagement: Math.round(friend.daysSinceFirstEngagement),
        engagementFrequency: Math.round(friend.engagementFrequency * 100) / 100
      }))
    
    console.log(`Found ${friends.length} reply guys`)
    
    if (friends.length === 0) {
      return NextResponse.json({ 
        friends: [],
        message: "No reply guys found! Try posting more content to attract some reply guys."
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
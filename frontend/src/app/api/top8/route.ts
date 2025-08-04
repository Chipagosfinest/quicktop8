import { NextRequest, NextResponse } from "next/server"

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || "1E58A226-A64C-4CF3-A047-FBED94F36101"

interface Top8Friend {
  fid: number
  username: string
  display_name: string
  pfp_url: string
  bio: string
  interactions: number
  lastInteraction: string
  interactionTypes: {
    likes: number
    replies: number
    recasts: number
  }
}

export async function POST(request: NextRequest) {
  try {
    const { fid } = await request.json()

    if (!fid) {
      return NextResponse.json({ error: "FID is required" }, { status: 400 })
    }

    // Get user's recent casts
    const castsResponse = await fetch(`https://api.neynar.com/v2/farcaster/cast/list?fid=${fid}&limit=50`, {
      headers: {
        'api_key': NEYNAR_API_KEY,
        'accept': 'application/json'
      }
    })

    if (!castsResponse.ok) {
      throw new Error(`Failed to fetch casts: ${castsResponse.status}`)
    }

    const castsData = await castsResponse.json()
    const casts = castsData.casts || []

    // Analyze interactions on each cast
    const friendInteractions: Map<number, Top8Friend> = new Map()

    for (const cast of casts) {
      const castHash = cast.hash

      // Get reactions for this cast
      const reactionsResponse = await fetch(`https://api.neynar.com/v2/farcaster/cast/reactions?cast_hash=${castHash}`, {
        headers: {
          'api_key': NEYNAR_API_KEY,
          'accept': 'application/json'
        }
      })

      if (reactionsResponse.ok) {
        const reactionsData = await reactionsResponse.json()
        
        // Process likes
        if (reactionsData.reactions?.likes) {
          for (const like of reactionsData.reactions.likes) {
            const friendFid = like.reactor.fid
            if (friendFid !== fid) {
              const existing = friendInteractions.get(friendFid) || {
                fid: friendFid,
                username: like.reactor.username,
                display_name: like.reactor.display_name,
                pfp_url: like.reactor.pfp_url,
                bio: like.reactor.bio || "",
                interactions: 0,
                lastInteraction: like.timestamp,
                interactionTypes: { likes: 0, replies: 0, recasts: 0 }
              }
              
              existing.interactions++
              existing.interactionTypes.likes++
              if (new Date(like.timestamp) > new Date(existing.lastInteraction)) {
                existing.lastInteraction = like.timestamp
              }
              
              friendInteractions.set(friendFid, existing)
            }
          }
        }

        // Process recasts
        if (reactionsData.reactions?.recasts) {
          for (const recast of reactionsData.reactions.recasts) {
            const friendFid = recast.reactor.fid
            if (friendFid !== fid) {
              const existing = friendInteractions.get(friendFid) || {
                fid: friendFid,
                username: recast.reactor.username,
                display_name: recast.reactor.display_name,
                pfp_url: recast.reactor.pfp_url,
                bio: recast.reactor.bio || "",
                interactions: 0,
                lastInteraction: recast.timestamp,
                interactionTypes: { likes: 0, replies: 0, recasts: 0 }
              }
              
              existing.interactions++
              existing.interactionTypes.recasts++
              if (new Date(recast.timestamp) > new Date(existing.lastInteraction)) {
                existing.lastInteraction = recast.timestamp
              }
              
              friendInteractions.set(friendFid, existing)
            }
          }
        }
      }

      // Get replies for this cast
      const repliesResponse = await fetch(`https://api.neynar.com/v2/farcaster/cast/replies?cast_hash=${castHash}`, {
        headers: {
          'api_key': NEYNAR_API_KEY,
          'accept': 'application/json'
        }
      })

      if (repliesResponse.ok) {
        const repliesData = await repliesResponse.json()
        
        if (repliesData.replies) {
          for (const reply of repliesData.replies) {
            const friendFid = reply.author.fid
            if (friendFid !== fid) {
              const existing = friendInteractions.get(friendFid) || {
                fid: friendFid,
                username: reply.author.username,
                display_name: reply.author.display_name,
                pfp_url: reply.author.pfp_url,
                bio: reply.author.bio || "",
                interactions: 0,
                lastInteraction: reply.timestamp,
                interactionTypes: { likes: 0, replies: 0, recasts: 0 }
              }
              
              existing.interactions++
              existing.interactionTypes.replies++
              if (new Date(reply.timestamp) > new Date(existing.lastInteraction)) {
                existing.lastInteraction = reply.timestamp
              }
              
              friendInteractions.set(friendFid, existing)
            }
          }
        }
      }
    }

    // Convert to array and sort by interactions
    const friends = Array.from(friendInteractions.values())
      .sort((a, b) => b.interactions - a.interactions)
      .slice(0, 8)

    return NextResponse.json({ friends })
  } catch (error) {
    console.error("Top8 API error:", error)
    return NextResponse.json(
      { error: "Failed to analyze interactions" }, 
      { status: 500 }
    )
  }
}

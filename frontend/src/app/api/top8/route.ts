import { NextRequest, NextResponse } from "next/server"

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { fid } = await request.json()

    if (!fid) {
      return NextResponse.json({ error: "FID is required" }, { status: 400 })
    }

    if (!NEYNAR_API_KEY) {
      return NextResponse.json({ error: "Neynar API key not configured" }, { status: 500 })
    }

    // Fetch user's casts from Neynar API
    const castsResponse = await fetch(`https://api.neynar.com/v2/farcaster/casts?fid=${fid}&limit=200`, {
      headers: {
        accept: "application/json",
        api_key: NEYNAR_API_KEY,
      },
    })

    if (!castsResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch user casts" }, { status: 500 })
    }

    const castsData = await castsResponse.json()

    // Analyze interactions to build Top 8
    const interactionMap = new Map()

    // Process casts and their reactions/replies
    for (const cast of castsData.result?.casts || []) {
      // Process reactions
      if (cast.reactions) {
        for (const reaction of cast.reactions.likes || []) {
          const userId = reaction.fid
          if (userId !== fid) {
            const current = interactionMap.get(userId) || {
              likes: 0,
              replies: 0,
              recasts: 0,
              user: reaction,
              lastInteraction: cast.timestamp,
            }
            current.likes++
            if (new Date(cast.timestamp) > new Date(current.lastInteraction)) {
              current.lastInteraction = cast.timestamp
            }
            interactionMap.set(userId, current)
          }
        }

        for (const recast of cast.reactions.recasts || []) {
          const userId = recast.fid
          if (userId !== fid) {
            const current = interactionMap.get(userId) || {
              likes: 0,
              replies: 0,
              recasts: 0,
              user: recast,
              lastInteraction: cast.timestamp,
            }
            current.recasts++
            if (new Date(cast.timestamp) > new Date(current.lastInteraction)) {
              current.lastInteraction = cast.timestamp
            }
            interactionMap.set(userId, current)
          }
        }
      }

      // Process replies
      if (cast.replies) {
        for (const reply of cast.replies.casts || []) {
          const userId = reply.author.fid
          if (userId !== fid) {
            const current = interactionMap.get(userId) || {
              likes: 0,
              replies: 0,
              recasts: 0,
              user: reply.author,
              lastInteraction: reply.timestamp,
            }
            current.replies++
            if (new Date(reply.timestamp) > new Date(current.lastInteraction)) {
              current.lastInteraction = reply.timestamp
            }
            interactionMap.set(userId, current)
          }
        }
      }
    }

    // Convert to array and sort by total interactions
    const friends = Array.from(interactionMap.entries())
      .map(([fid, data]) => ({
        fid: Number.parseInt(fid),
        username: data.user.username,
        display_name: data.user.display_name,
        pfp_url: data.user.pfp_url,
        bio: data.user.profile?.bio?.text || "",
        interactions: data.likes + data.replies + data.recasts,
        lastInteraction: data.lastInteraction,
        interactionTypes: {
          likes: data.likes,
          replies: data.replies,
          recasts: data.recasts,
        },
      }))
      .sort((a, b) => b.interactions - a.interactions)
      .slice(0, 8)

    return NextResponse.json({ friends })
  } catch (error) {
    console.error("Error fetching Top 8 data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

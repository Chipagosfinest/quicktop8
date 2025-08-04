import { NextRequest, NextResponse } from "next/server"

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || "1E58A226-A64C-4CF3-A047-FBED94F36101"

interface InteractionData {
  fid: number
  username: string
  display_name: string
  pfp_url: string
  bio: string
  replyCount: number
  likeCount: number
  recastCount: number
  totalScore: number
  lastInteraction: string
}

export async function POST(request: NextRequest) {
  try {
    const { fid } = await request.json()

    if (!fid) {
      return NextResponse.json({ error: "FID is required" }, { status: 400 })
    }

    console.log(`Starting Top 8 calculation for FID: ${fid}`)

    // Calculate date 45 days ago for recent interactions
    const fortyFiveDaysAgo = new Date()
    fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45)
    const fromTimestamp = Math.floor(fortyFiveDaysAgo.getTime() / 1000)

    console.log(`Analyzing interactions from: ${fortyFiveDaysAgo.toISOString()}`)

    // Get user's recent casts from last 45 days (limit to 50 for better coverage)
    const castsResponse = await fetch(`https://api.neynar.com/v2/farcaster/cast/list?fid=${fid}&limit=50&from_timestamp=${fromTimestamp}`, {
      headers: {
        'api_key': NEYNAR_API_KEY,
        'accept': 'application/json'
      }
    })

    if (!castsResponse.ok) {
      console.error(`Failed to fetch casts: ${castsResponse.status}`)
      return NextResponse.json({ error: "Failed to fetch user casts" }, { status: 500 })
    }

    const castsData = await castsResponse.json()
    const casts = castsData.casts || []

    if (casts.length === 0) {
      return NextResponse.json({ friends: [] })
    }

    console.log(`Found ${casts.length} casts from last 45 days to analyze`)

    const interactionMap = new Map<number, InteractionData>()

    // Process each cast (analyze all since they're already filtered by time)
    for (let i = 0; i < casts.length; i++) {
      const cast = casts[i]
      console.log(`Processing cast ${i + 1}/${casts.length}`)

      // Get reactions for this cast
      const reactionsResponse = await fetch(`https://api.neynar.com/v2/farcaster/cast/reactions?cast_hash=${cast.hash}&limit=50`, {
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
              updateInteractionScore(interactionMap, {
                fid: friendFid,
                username: like.reactor.username,
                display_name: like.reactor.display_name,
                pfp_url: like.reactor.pfp_url,
                bio: like.reactor.bio || "",
                timestamp: like.timestamp
              }, 'like')
            }
          }
        }

        // Process recasts
        if (reactionsData.reactions?.recasts) {
          for (const recast of reactionsData.reactions.recasts) {
            const friendFid = recast.reactor.fid
            if (friendFid !== fid) {
              updateInteractionScore(interactionMap, {
                fid: friendFid,
                username: recast.reactor.username,
                display_name: recast.reactor.display_name,
                pfp_url: recast.reactor.pfp_url,
                bio: recast.reactor.bio || "",
                timestamp: recast.timestamp
              }, 'recast')
            }
          }
        }
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Convert to array and sort by total score
    const friends = Array.from(interactionMap.values())
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 8)

    console.log(`Found ${friends.length} top friends`)

    return NextResponse.json({ friends })
  } catch (error) {
    console.error("Top8 API error:", error)
    return NextResponse.json(
      { error: "Failed to analyze interactions" }, 
      { status: 500 }
    )
  }
}

interface UserData {
  fid: number
  username: string
  display_name: string
  pfp_url: string
  bio: string
  timestamp: string
}

function updateInteractionScore(
  map: Map<number, InteractionData>, 
  user: UserData, 
  type: 'like' | 'recast' | 'reply'
) {
  const existing = map.get(user.fid) || {
    fid: user.fid,
    username: user.username,
    display_name: user.display_name,
    pfp_url: user.pfp_url,
    bio: user.bio,
    replyCount: 0,
    likeCount: 0,
    recastCount: 0,
    totalScore: 0,
    lastInteraction: user.timestamp
  }

  switch (type) {
    case 'like':
      existing.likeCount++
      existing.totalScore += 1
      break
    case 'recast':
      existing.recastCount++
      existing.totalScore += 2
      break
    case 'reply':
      existing.replyCount++
      existing.totalScore += 3
      break
  }

  if (new Date(user.timestamp) > new Date(existing.lastInteraction)) {
    existing.lastInteraction = user.timestamp
  }

  map.set(user.fid, existing)
}

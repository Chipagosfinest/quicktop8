import { NextRequest, NextResponse } from "next/server"

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || "1E58A226-A64C-4CF3-A047-FBED94F36101"

interface MutualFollowData {
  fid: number
  username: string
  display_name: string
  pfp_url: string
  bio: string
  followDate: string
  firstEngagement: string
  engagementType: 'like' | 'recast' | 'reply'
  totalInteractions: number
  relationshipScore: number
  // New fields for ride or die features
  originalEngagementCastHash: string
  originalEngagementCastUrl: string
  rideOrDieScore: number
  daysSinceFirstEngagement: number
  engagementFrequency: number
}

interface UserData {
  fid: number
  username: string
  display_name: string
  pfp_url: string
  bio: string
  timestamp: string
}

function updateMutualFollowData(
  map: Map<number, MutualFollowData>, 
  user: UserData, 
  followDate: string,
  engagementType: 'like' | 'recast' | 'reply',
  engagementDate: string,
  castHash?: string
) {
  const existing = map.get(user.fid)
  
  if (existing) {
    existing.totalInteractions++
    // Update first engagement if this is earlier
    if (new Date(engagementDate) < new Date(existing.firstEngagement)) {
      existing.firstEngagement = engagementDate
      existing.engagementType = engagementType
      if (castHash) {
        existing.originalEngagementCastHash = castHash
        existing.originalEngagementCastUrl = `https://warpcast.com/~/conversations/${castHash}`
      }
    }
    
    // Calculate relationship score based on follow duration and interactions
    const followDuration = Date.now() - new Date(followDate).getTime()
    const daysFollowed = followDuration / (1000 * 60 * 60 * 24)
    existing.relationshipScore = daysFollowed + (existing.totalInteractions * 10)
    
    // Calculate ride or die specific metrics
    const firstEngagementDate = new Date(existing.firstEngagement)
    existing.daysSinceFirstEngagement = (Date.now() - firstEngagementDate.getTime()) / (1000 * 60 * 60 * 24)
    existing.engagementFrequency = existing.totalInteractions / Math.max(existing.daysSinceFirstEngagement, 1)
    
    // Calculate follow duration for scoring
    const followDurationForScoring = Date.now() - new Date(existing.followDate).getTime()
    const daysFollowedForScoring = followDurationForScoring / (1000 * 60 * 60 * 24)
    
    // Ride or die score: combination of duration, frequency, and consistency
    existing.rideOrDieScore = Math.round(
      (existing.daysSinceFirstEngagement * 2) + // Longevity bonus
      (existing.engagementFrequency * 50) + // Frequency bonus
      (existing.totalInteractions * 5) + // Total engagement bonus
      (daysFollowedForScoring * 0.5) // Follow duration bonus
    )
  } else {
    const newData: MutualFollowData = {
      fid: user.fid,
      username: user.username,
      display_name: user.display_name,
      pfp_url: user.pfp_url,
      bio: user.bio,
      followDate: followDate,
      firstEngagement: engagementDate,
      engagementType: engagementType,
      totalInteractions: 1,
      relationshipScore: 0,
      // Initialize new fields
      originalEngagementCastHash: castHash || "",
      originalEngagementCastUrl: castHash ? `https://warpcast.com/~/conversations/${castHash}` : "",
      rideOrDieScore: 0,
      daysSinceFirstEngagement: 0,
      engagementFrequency: 0
    }
    // Calculate initial relationship score
    const followDuration = Date.now() - new Date(followDate).getTime()
    const daysFollowed = followDuration / (1000 * 60 * 60 * 24)
    newData.relationshipScore = daysFollowed + 10
    
    // Calculate initial ride or die metrics
    const firstEngagementDate = new Date(engagementDate)
    newData.daysSinceFirstEngagement = (Date.now() - firstEngagementDate.getTime()) / (1000 * 60 * 60 * 24)
    newData.engagementFrequency = 1 / Math.max(newData.daysSinceFirstEngagement, 1)
    
    // Calculate follow duration for scoring
    const followDurationForScoring = Date.now() - new Date(followDate).getTime()
    const daysFollowedForScoring = followDurationForScoring / (1000 * 60 * 60 * 24)
    
    newData.rideOrDieScore = Math.round(
      (newData.daysSinceFirstEngagement * 2) + 
      (newData.engagementFrequency * 50) + 
      5 + 
      (daysFollowedForScoring * 0.5)
    )
    map.set(user.fid, newData)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { fid } = await request.json()

    if (!fid) {
      return NextResponse.json({ error: "FID is required" }, { status: 400 })
    }

    console.log(`Starting Ride or Die Top 8 calculation for FID: ${fid}`)
    console.log(`API Key available: ${NEYNAR_API_KEY ? 'Yes' : 'No'}`)

    const mutualFollowsMap = new Map<number, MutualFollowData>()
    
    // Step 1: Get reciprocal followers (mutual follows) using the correct endpoint
    console.log(`Fetching reciprocal followers for FID: ${fid}`)
    
    try {
      const reciprocalResponse = await fetch(`https://api.neynar.com/v2/farcaster/followers/reciprocal?fid=${fid}&limit=100`, {
        headers: {
          'x-api-key': NEYNAR_API_KEY,
          'accept': 'application/json'
        },
        signal: AbortSignal.timeout(15000)
      })
      
      if (!reciprocalResponse.ok) {
        console.error(`Failed to fetch reciprocal followers: ${reciprocalResponse.status}`)
        return NextResponse.json({ 
          error: "Failed to fetch mutual follows. Please try again or check if the FID is correct." 
        }, { status: 500 })
      }
      
      const reciprocalData = await reciprocalResponse.json()
      const mutualFollows = reciprocalData.users || []
      console.log(`Found ${mutualFollows.length} mutual follows`)
      
      if (mutualFollows.length === 0) {
        return NextResponse.json({ 
          friends: [],
          message: "No mutual follows found. This user might not have any mutual connections yet."
        })
      }
      
      // Step 2: For each mutual follow, find their recent casts and check for user engagement
      for (let i = 0; i < Math.min(mutualFollows.length, 20); i++) {
        const mutualFollow = mutualFollows[i]
        const user = mutualFollow.user // The user data is nested under 'user' property
        console.log(`Processing mutual follow ${i + 1}/${Math.min(mutualFollows.length, 20)}: ${user.username}`)
        
        try {
          // Get the user's recent casts to see if mutual follow engaged with them
          const userCastsResponse = await fetch(`https://api.neynar.com/v2/farcaster/feed/user/casts?fid=${fid}&limit=20&viewer_fid=${user.fid}`, {
            headers: {
              'x-api-key': NEYNAR_API_KEY,
              'accept': 'application/json'
            },
            signal: AbortSignal.timeout(8000)
          })
          
          if (userCastsResponse.ok) {
            const userCastsData = await userCastsResponse.json()
            const userCasts = userCastsData.casts || []
            
            // Check reactions to user's casts to see if mutual follow engaged
            for (const cast of userCasts.slice(0, 5)) {
              // Get detailed reactions for this cast
              const reactionsResponse = await fetch(`https://api.neynar.com/v2/farcaster/reactions/cast?hash=${cast.hash}&types=like,recast&limit=50`, {
                headers: {
                  'x-api-key': NEYNAR_API_KEY,
                  'accept': 'application/json'
                },
                signal: AbortSignal.timeout(5000)
              })
              
              if (reactionsResponse.ok) {
                const reactionsData = await reactionsResponse.json()
                const reactions = reactionsData.reactions || []
                
                // Check if mutual follow liked this cast
                const mutualFollowLike = reactions.find((reaction: any) => 
                  reaction.reaction_type === 'like' && reaction.user.fid === user.fid
                )
                if (mutualFollowLike) {
                  updateMutualFollowData(mutualFollowsMap, {
                    fid: user.fid,
                    username: user.username,
                    display_name: user.display_name,
                    pfp_url: user.pfp_url,
                    bio: user.profile?.bio?.text || "",
                    timestamp: mutualFollowLike.reaction_timestamp
                  }, mutualFollow.timestamp || new Date().toISOString(), 'like', mutualFollowLike.reaction_timestamp, cast.hash)
                  break
                }
                
                // Check if mutual follow recast this cast
                const mutualFollowRecast = reactions.find((reaction: any) => 
                  reaction.reaction_type === 'recast' && reaction.user.fid === user.fid
                )
                if (mutualFollowRecast) {
                  updateMutualFollowData(mutualFollowsMap, {
                    fid: user.fid,
                    username: user.username,
                    display_name: user.display_name,
                    pfp_url: user.pfp_url,
                    bio: user.profile?.bio?.text || "",
                    timestamp: mutualFollowRecast.reaction_timestamp
                  }, mutualFollow.timestamp || new Date().toISOString(), 'recast', mutualFollowRecast.reaction_timestamp, cast.hash)
                  break
                }
              }
              
              // Add delay to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, 200))
            }
          }
        } catch (error) {
          console.error(`Error processing mutual follow ${user.username}:`, error)
          continue
        }
        
        // Add delay between mutual follows
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
      // Step 5: Sort by ride or die score and return top 8
      const friends = Array.from(mutualFollowsMap.values())
        .sort((a, b) => b.rideOrDieScore - a.rideOrDieScore)
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
          // New ride or die fields
          originalEngagementCastHash: friend.originalEngagementCastHash,
          originalEngagementCastUrl: friend.originalEngagementCastUrl,
          rideOrDieScore: friend.rideOrDieScore,
          daysSinceFirstEngagement: Math.round(friend.daysSinceFirstEngagement),
          engagementFrequency: Math.round(friend.engagementFrequency * 100) / 100
        }))
      
      console.log(`Found ${friends.length} top mutual follows`)
      
      if (friends.length === 0) {
        return NextResponse.json({ 
          friends: [],
          message: "No mutual follows with engagement found. Try with a different FID or check back later."
        })
      }
      
      return NextResponse.json({ friends })
      
    } catch (error) {
      console.error('Error in mutual follows calculation:', error)
      return NextResponse.json({ 
        error: "Failed to calculate mutual follows. Please try again." 
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Error in POST request:', error)
    return NextResponse.json({ 
      error: "Internal server error. Please try again." 
    }, { status: 500 })
  }
}

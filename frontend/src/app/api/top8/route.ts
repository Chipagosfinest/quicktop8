import { NextRequest, NextResponse } from "next/server"

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || "1E58A226-A64C-4CF3-A047-FBED94F36101"

interface MutualFollowData {
  fid: number
  username: string
  display_name: string
  pfp_url: string
  bio: string
  ens_name?: string
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
  ens_name?: string
  timestamp: string
}

// Function to fetch ENS name for a user
async function fetchENSName(fid: number): Promise<string | undefined> {
  try {
    const response = await fetch(`https://api.neynar.com/v2/farcaster/user/verifications?fid=${fid}`, {
      headers: {
        'x-api-key': NEYNAR_API_KEY,
        'accept': 'application/json'
      },
      signal: AbortSignal.timeout(3000)
    })
    
    if (response.ok) {
      const data = await response.json()
      const ensVerification = data.verifications?.find((v: any) => v.protocol === 'ens')
      return ensVerification?.username || undefined
    }
  } catch (error) {
    console.error(`Error fetching ENS for FID ${fid}:`, error)
  }
  return undefined
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
      ens_name: user.ens_name,
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
    
    // Initial ride or die score
    newData.rideOrDieScore = Math.round(
      (newData.daysSinceFirstEngagement * 2) +
      (newData.engagementFrequency * 50) +
      (newData.totalInteractions * 5) +
      (daysFollowedForScoring * 0.5)
    )
    
    map.set(user.fid, newData)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fid = searchParams.get('fid')

    if (!fid) {
      return NextResponse.json({ error: "FID is required" }, { status: 400 })
    }

    console.log(`Starting simplified Top 8 calculation for FID: ${fid}`)
    console.log(`API Key available: ${NEYNAR_API_KEY ? 'Yes' : 'No'}`)

    const mutualFollowsMap = new Map<number, MutualFollowData>()
    
    // Step 1: Get reciprocal followers (mutual follows) - FAST
    console.log(`Fetching reciprocal followers for FID: ${fid}`)
    
    try {
      const reciprocalResponse = await fetch(`https://api.neynar.com/v2/farcaster/followers/reciprocal?fid=${fid}&limit=50`, {
        headers: {
          'x-api-key': NEYNAR_API_KEY,
          'accept': 'application/json'
        },
        signal: AbortSignal.timeout(10000)
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
      
      // Step 2: Get user's recent casts with reactions in one call - FAST
      console.log(`Fetching user's recent casts with reactions`)
      const userCastsResponse = await fetch(`https://api.neynar.com/v2/farcaster/feed/user/casts?fid=${fid}&limit=10`, {
        headers: {
          'x-api-key': NEYNAR_API_KEY,
          'accept': 'application/json'
        },
        signal: AbortSignal.timeout(8000)
      })
      
      if (userCastsResponse.ok) {
        const userCastsData = await userCastsResponse.json()
        const userCasts = userCastsData.casts || []
        
        // Step 3: For each cast, get reactions in parallel - FAST
        const reactionPromises = userCasts.slice(0, 5).map(async (cast: any) => {
          try {
            const reactionsResponse = await fetch(`https://api.neynar.com/v2/farcaster/cast/reactions?identifier=${cast.hash}&type=hash&limit=100`, {
              headers: {
                'x-api-key': NEYNAR_API_KEY,
                'accept': 'application/json'
              },
              signal: AbortSignal.timeout(5000)
            })
            
            if (reactionsResponse.ok) {
              const reactionsData = await reactionsResponse.json()
              return {
                castHash: cast.hash,
                reactions: reactionsData.reactions || []
              }
            }
          } catch (error) {
            console.error(`Error fetching reactions for cast ${cast.hash}:`, error)
          }
          return { castHash: cast.hash, reactions: [] }
        })
        
        // Wait for all reaction requests to complete
        const reactionResults = await Promise.all(reactionPromises)
        
        // Step 4: Process reactions to find mutual follow engagement - FAST
        for (const result of reactionResults) {
          for (const reaction of result.reactions) {
            // Check if this reaction is from a mutual follow
            const mutualFollow = mutualFollows.find((mf: any) => mf.user.fid === reaction.reactor_user?.fid)
            
            if (mutualFollow) {
              const user = mutualFollow.user
              updateMutualFollowData(mutualFollowsMap, {
                fid: user.fid,
                username: user.username,
                display_name: user.display_name,
                pfp_url: user.pfp_url,
                bio: user.profile?.bio?.text || "",
                timestamp: reaction.timestamp
              }, mutualFollow.timestamp || new Date().toISOString(), reaction.reaction_type, reaction.timestamp, result.castHash)
            }
          }
        }
      }
      
      // Step 5: Sort by ride or die score and return top 8
      const topFriends = Array.from(mutualFollowsMap.values())
        .sort((a, b) => b.rideOrDieScore - a.rideOrDieScore)
        .slice(0, 8)
      
      // Fetch ENS names for top friends
      const friendsWithENS = await Promise.all(
        topFriends.map(async (friend) => {
          const ensName = await fetchENSName(friend.fid)
          return {
            fid: friend.fid,
            username: friend.username,
            display_name: friend.display_name,
            pfp_url: friend.pfp_url,
            bio: friend.bio,
            ens_name: ensName,
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
          }
        })
      )
      
      const friends = friendsWithENS
      
      console.log(`Found ${friends.length} top mutual follows with engagement`)
      
      // If no mutual follows with engagement found, return some mutual follows anyway
      if (friends.length === 0) {
        console.log("No mutual follows with engagement found, returning mutual follows without engagement data")
        
        const fallbackFriends = mutualFollows.slice(0, 8).map((mutualFollow: any, index: number) => {
          const user = mutualFollow.user
          return {
            fid: user.fid,
            username: user.username,
            display_name: user.display_name,
            pfp_url: user.pfp_url,
            bio: user.profile?.bio?.text || "",
            followDate: mutualFollow.timestamp || new Date().toISOString(),
            firstEngagement: "",
            engagementType: 'follow' as any,
            totalInteractions: 0,
            relationshipScore: 10 + index, // Give some basic scoring
            originalEngagementCastHash: "",
            originalEngagementCastUrl: "",
            rideOrDieScore: 10 + index,
            daysSinceFirstEngagement: 0,
            engagementFrequency: 0
          }
        })
        
        return NextResponse.json({ 
          friends: fallbackFriends,
          message: "Found mutual follows but no engagement data yet. Start interacting with them!"
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
    console.error('Error in GET request:', error)
    return NextResponse.json({ 
      error: "Internal server error. Please try again." 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}

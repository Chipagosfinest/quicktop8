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
  engagementDate: string
) {
  const existing = map.get(user.fid)
  
  if (existing) {
    existing.totalInteractions++
    // Update first engagement if this is earlier
    if (new Date(engagementDate) < new Date(existing.firstEngagement)) {
      existing.firstEngagement = engagementDate
      existing.engagementType = engagementType
    }
    // Calculate relationship score based on follow duration and interactions
    const followDuration = Date.now() - new Date(followDate).getTime()
    const daysFollowed = followDuration / (1000 * 60 * 60 * 24)
    existing.relationshipScore = daysFollowed + (existing.totalInteractions * 10)
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
      relationshipScore: 0
    }
    // Calculate initial relationship score
    const followDuration = Date.now() - new Date(followDate).getTime()
    const daysFollowed = followDuration / (1000 * 60 * 60 * 24)
    newData.relationshipScore = daysFollowed + 10
    map.set(user.fid, newData)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { fid } = await request.json()

    if (!fid) {
      return NextResponse.json({ error: "FID is required" }, { status: 400 })
    }

    console.log(`Starting Longest Mutual Follows calculation for FID: ${fid}`)
    console.log(`API Key available: ${NEYNAR_API_KEY ? 'Yes' : 'No'}`)

    const mutualFollowsMap = new Map<number, MutualFollowData>()
    
    // Step 1: Get user's followers
    console.log(`Fetching user's followers for FID: ${fid}`)
    
    try {
      const followersResponse = await fetch(`https://api.neynar.com/v2/farcaster/followers?fid=${fid}&limit=100`, {
        headers: {
          'x-api-key': NEYNAR_API_KEY,
          'accept': 'application/json'
        },
        signal: AbortSignal.timeout(10000)
      })
      
      if (!followersResponse.ok) {
        console.error(`Failed to fetch followers: ${followersResponse.status}`)
        return NextResponse.json({ 
          error: "Failed to fetch user followers. Please try again or check if the FID is correct." 
        }, { status: 500 })
      }
      
      const followersData = await followersResponse.json()
      const followers = followersData.users || []
      console.log(`Found ${followers.length} followers`)
      
      // Step 2: Get user's following
      console.log(`Fetching user's following for FID: ${fid}`)
      
      const followingResponse = await fetch(`https://api.neynar.com/v2/farcaster/following?fid=${fid}&limit=100`, {
        headers: {
          'x-api-key': NEYNAR_API_KEY,
          'accept': 'application/json'
        },
        signal: AbortSignal.timeout(10000)
      })
      
      if (!followingResponse.ok) {
        console.error(`Failed to fetch following: ${followingResponse.status}`)
        return NextResponse.json({ 
          error: "Failed to fetch user following. Please try again or check if the FID is correct." 
        }, { status: 500 })
      }
      
      const followingData = await followingResponse.json()
      const following = followingData.users || []
      console.log(`Found ${following.length} following`)
      
      // Step 3: Find mutual follows
      const followersSet = new Set(followers.map((f: any) => f.fid))
      const mutualFollows = following.filter((f: any) => followersSet.has(f.fid))
      console.log(`Found ${mutualFollows.length} mutual follows`)
      
      if (mutualFollows.length === 0) {
        return NextResponse.json({ 
          friends: [],
          message: "No mutual follows found. This user might not have any mutual connections yet."
        })
      }
      
      // Step 4: For each mutual follow, find their first engagement
      for (let i = 0; i < Math.min(mutualFollows.length, 20); i++) {
        const mutualFollow = mutualFollows[i]
        console.log(`Processing mutual follow ${i + 1}/${Math.min(mutualFollows.length, 20)}: ${mutualFollow.username}`)
        
        try {
          // Get their recent interactions with the user
          const interactionsResponse = await fetch(`https://api.neynar.com/v2/farcaster/feed/user/casts?fid=${mutualFollow.fid}&limit=10`, {
            headers: {
              'x-api-key': NEYNAR_API_KEY,
              'accept': 'application/json'
            },
            signal: AbortSignal.timeout(5000)
          })
          
          if (interactionsResponse.ok) {
            const interactionsData = await interactionsResponse.json()
            const casts = interactionsData.casts || []
            
            // Check reactions to these casts to see if user engaged
            for (const cast of casts.slice(0, 3)) {
              const reactionsResponse = await fetch(`https://api.neynar.com/v2/farcaster/reactions/cast?hash=${cast.hash}&limit=50`, {
                headers: {
                  'x-api-key': NEYNAR_API_KEY,
                  'accept': 'application/json'
                },
                signal: AbortSignal.timeout(3000)
              })
              
              if (reactionsResponse.ok) {
                const reactionsData = await reactionsResponse.json()
                
                // Check if user liked this cast
                if (reactionsData.reactions?.likes) {
                  const userLike = reactionsData.reactions.likes.find((like: any) => like.reactor.fid === parseInt(fid))
                  if (userLike) {
                    updateMutualFollowData(mutualFollowsMap, {
                      fid: mutualFollow.fid,
                      username: mutualFollow.username,
                      display_name: mutualFollow.display_name,
                      pfp_url: mutualFollow.pfp_url,
                      bio: mutualFollow.bio || "",
                      timestamp: userLike.timestamp
                    }, mutualFollow.followed_at || new Date().toISOString(), 'like', userLike.timestamp)
                    break
                  }
                }
                
                // Check if user recast this cast
                if (reactionsData.reactions?.recasts) {
                  const userRecast = reactionsData.reactions.recasts.find((recast: any) => recast.reactor.fid === parseInt(fid))
                  if (userRecast) {
                    updateMutualFollowData(mutualFollowsMap, {
                      fid: mutualFollow.fid,
                      username: mutualFollow.username,
                      display_name: mutualFollow.display_name,
                      pfp_url: mutualFollow.pfp_url,
                      bio: mutualFollow.bio || "",
                      timestamp: userRecast.timestamp
                    }, mutualFollow.followed_at || new Date().toISOString(), 'recast', userRecast.timestamp)
                    break
                  }
                }
              }
              
              // Add delay to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, 200))
            }
          }
        } catch (error) {
          console.error(`Error processing mutual follow ${mutualFollow.username}:`, error)
          continue
        }
        
        // Add delay between mutual follows
        await new Promise(resolve => setTimeout(resolve, 300))
      }
      
      // Step 5: Sort by relationship score and return top 8
      const friends = Array.from(mutualFollowsMap.values())
        .sort((a, b) => b.relationshipScore - a.relationshipScore)
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
          relationshipScore: Math.round(friend.relationshipScore)
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

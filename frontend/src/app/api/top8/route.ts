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
    console.log(`API Key available: ${NEYNAR_API_KEY ? 'Yes' : 'No'}`)
    console.log(`API Key length: ${NEYNAR_API_KEY?.length || 0}`)

    // Calculate date 45 days ago for recent interactions
    const fortyFiveDaysAgo = new Date()
    fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45)
    const fromTimestamp = Math.floor(fortyFiveDaysAgo.getTime() / 1000)

    console.log(`Analyzing interactions from: ${fortyFiveDaysAgo.toISOString()}`)

    // Get user's last 50 casts and analyze all interactions
    console.log(`Fetching user's last 50 casts for FID: ${fid}`)
    
    const interactionMap = new Map<number, InteractionData>()
    
    // Get user's recent casts
    try {
      const castsResponse = await fetch(`https://api.neynar.com/v2/farcaster/feed/user/casts?fid=${fid}&limit=50`, {
        headers: {
          'x-api-key': NEYNAR_API_KEY,
          'accept': 'application/json'
        },
        signal: AbortSignal.timeout(15000)
      })
      
      if (castsResponse.ok) {
        const castsData = await castsResponse.json()
        const casts = castsData.casts || []
        console.log(`Found ${casts.length} casts to analyze`)
        
        // Process each cast to find all interactions
        for (let i = 0; i < casts.length; i++) {
          const cast = casts[i]
          console.log(`Analyzing cast ${i + 1}/${casts.length}: ${cast.hash}`)
          
          try {
            // Get all reactions for this cast (likes, recasts, replies)
            const reactionsResponse = await fetch(`https://api.neynar.com/v2/farcaster/cast/reactions?cast_hash=${cast.hash}&limit=100`, {
              headers: {
                'x-api-key': NEYNAR_API_KEY,
                'accept': 'application/json'
              },
              signal: AbortSignal.timeout(8000)
            })
            
            if (reactionsResponse.ok) {
              const reactionsData = await reactionsResponse.json()
              
              // Process likes
              if (reactionsData.reactions?.likes) {
                for (const like of reactionsData.reactions.likes) {
                  const reactor = like.reactor
                  if (reactor && reactor.fid !== fid) {
                    updateInteractionScore(interactionMap, {
                      fid: reactor.fid,
                      username: reactor.username,
                      display_name: reactor.display_name,
                      pfp_url: reactor.pfp_url,
                      bio: reactor.bio || "",
                      timestamp: like.timestamp
                    }, 'like')
                  }
                }
              }
              
              // Process recasts
              if (reactionsData.reactions?.recasts) {
                for (const recast of reactionsData.reactions.recasts) {
                  const reactor = recast.reactor
                  if (reactor && reactor.fid !== fid) {
                    updateInteractionScore(interactionMap, {
                      fid: reactor.fid,
                      username: reactor.username,
                      display_name: reactor.display_name,
                      pfp_url: reactor.pfp_url,
                      bio: reactor.bio || "",
                      timestamp: recast.timestamp
                    }, 'recast')
                  }
                }
              }
            }
            
            // Get replies to this cast
            try {
              const repliesResponse = await fetch(`https://api.neynar.com/v2/farcaster/cast/replies?cast_hash=${cast.hash}&limit=50`, {
                headers: {
                  'x-api-key': NEYNAR_API_KEY,
                  'accept': 'application/json'
                },
                signal: AbortSignal.timeout(5000)
              })
              
              if (repliesResponse.ok) {
                const repliesData = await repliesResponse.json()
                
                for (const reply of repliesData.casts || []) {
                  const replier = reply.author
                  if (replier && replier.fid !== fid) {
                    updateInteractionScore(interactionMap, {
                      fid: replier.fid,
                      username: replier.username,
                      display_name: replier.display_name,
                      pfp_url: replier.pfp_url,
                      bio: replier.bio || "",
                      timestamp: reply.timestamp
                    }, 'reply')
                  }
                }
              }
            } catch (error) {
              console.error(`Error fetching replies for cast ${cast.hash}:`, error)
            }
            
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 300))
            
          } catch (error) {
            console.error(`Error processing cast ${i + 1}:`, error)
            continue
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user casts:', error)
    }
    
    // Also get user's own reactions to others' content
    console.log('Fetching user\'s reactions to others...')
    
    // Get user's likes
    try {
      const likesResponse = await fetch(`https://api.neynar.com/v2/farcaster/user/reactions?fid=${fid}&reaction_type=like&limit=50`, {
        headers: {
          'x-api-key': NEYNAR_API_KEY,
          'accept': 'application/json'
        },
        signal: AbortSignal.timeout(10000)
      })
      
      if (likesResponse.ok) {
        const likesData = await likesResponse.json()
        console.log(`Found ${likesData.reactions?.length || 0} likes by user`)
        
        for (const like of likesData.reactions || []) {
          const castAuthor = like.cast?.author
          if (castAuthor && castAuthor.fid !== fid) {
            updateInteractionScore(interactionMap, {
              fid: castAuthor.fid,
              username: castAuthor.username,
              display_name: castAuthor.display_name,
              pfp_url: castAuthor.pfp_url,
              bio: castAuthor.bio || "",
              timestamp: like.timestamp
            }, 'like')
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user likes:', error)
    }
    
    // Get user's recasts
    try {
      const recastsResponse = await fetch(`https://api.neynar.com/v2/farcaster/user/reactions?fid=${fid}&reaction_type=recast&limit=50`, {
        headers: {
          'x-api-key': NEYNAR_API_KEY,
          'accept': 'application/json'
        },
        signal: AbortSignal.timeout(10000)
      })
      
      if (recastsResponse.ok) {
        const recastsData = await recastsResponse.json()
        console.log(`Found ${recastsData.reactions?.length || 0} recasts by user`)
        
        for (const recast of recastsData.reactions || []) {
          const castAuthor = recast.cast?.author
          if (castAuthor && castAuthor.fid !== fid) {
            updateInteractionScore(interactionMap, {
              fid: castAuthor.fid,
              username: castAuthor.username,
              display_name: castAuthor.display_name,
              pfp_url: castAuthor.pfp_url,
              bio: castAuthor.bio || "",
              timestamp: recast.timestamp
            }, 'recast')
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user recasts:', error)
    }
    
    // Get user's replies to others
    try {
      const repliesResponse = await fetch(`https://api.neynar.com/v2/farcaster/feed/user/replies?fid=${fid}&limit=50`, {
        headers: {
          'x-api-key': NEYNAR_API_KEY,
          'accept': 'application/json'
        },
        signal: AbortSignal.timeout(10000)
      })
      
      if (repliesResponse.ok) {
        const repliesData = await repliesResponse.json()
        console.log(`Found ${repliesData.casts?.length || 0} replies by user`)
        
        for (const reply of repliesData.casts || []) {
          // Find the parent cast author
          if (reply.parent_cast_id) {
            try {
              const parentCastResponse = await fetch(`https://api.neynar.com/v2/farcaster/cast?cast_hash=${reply.parent_cast_id}`, {
                headers: {
                  'x-api-key': NEYNAR_API_KEY,
                  'accept': 'application/json'
                },
                signal: AbortSignal.timeout(5000)
              })
              
              if (parentCastResponse.ok) {
                const parentCastData = await parentCastResponse.json()
                const parentAuthor = parentCastData.cast?.author
                if (parentAuthor && parentAuthor.fid !== fid) {
                  updateInteractionScore(interactionMap, {
                    fid: parentAuthor.fid,
                    username: parentAuthor.username,
                    display_name: parentAuthor.display_name,
                    pfp_url: parentAuthor.pfp_url,
                    bio: parentAuthor.bio || "",
                    timestamp: reply.timestamp
                  }, 'reply')
                }
              }
            } catch (error) {
              console.error('Error fetching parent cast:', error)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user replies:', error)
    }

    // Convert to array and sort by total score
    const friends = Array.from(interactionMap.values())
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 8)

    console.log(`Found ${friends.length} top friends`)

    // If no friends found, return empty array instead of error
    if (friends.length === 0) {
      return NextResponse.json({ 
        friends: [],
        message: "No recent interactions found. Try with a different FID or check back later."
      })
    }

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

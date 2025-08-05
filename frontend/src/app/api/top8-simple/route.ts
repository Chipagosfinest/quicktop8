import { NextRequest, NextResponse } from 'next/server'

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY

// Neynar-specific rate limiting (300 RPM for starter plan)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(endpoint: string): boolean {
  const now = Date.now()
  const key = `neynar-${endpoint}`
  const limit = rateLimitMap.get(key)
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + 60000 }) // 1 minute window
    return true
  }
  
  // Conservative limit: 250 requests per minute to stay well under 300 RPM
  if (limit.count >= 250) {
    console.warn(`Rate limit exceeded for ${endpoint}`)
    return false
  }
  
  limit.count++
  return true
}

async function makeNeynarRequest(url: string, options: RequestInit = {}): Promise<Response> {
  if (!NEYNAR_API_KEY) {
    throw new Error('NEYNAR_API_KEY is not configured')
  }

  const defaultOptions: RequestInit = {
    headers: { 
      'x-api-key': NEYNAR_API_KEY, 
      'accept': 'application/json',
      'user-agent': 'QuickTop8/1.0'
    },
    signal: AbortSignal.timeout(10000) // 10 second timeout
  }

  return fetch(url, { ...defaultOptions, ...options })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fid = searchParams.get('fid')
    
    if (!fid) {
      return NextResponse.json({ error: 'FID parameter is required' }, { status: 400 })
    }

    console.log('🔍 Debug: Fetching Top 8 for FID:', fid)
    console.log('🔍 Debug: NEYNAR_API_KEY exists:', !!NEYNAR_API_KEY)
    
    const userFid = parseInt(fid)
    
    if (!NEYNAR_API_KEY) {
      console.error('❌ NEYNAR_API_KEY is not configured')
      return NextResponse.json({ 
        error: 'API key not configured',
        debug: {
          neynar_api_key_exists: !!NEYNAR_API_KEY,
          environment: process.env.NODE_ENV
        }
      }, { status: 500 })
    }

    // Test basic Neynar API call with improved error handling
    try {
      if (!checkRateLimit('user-info')) {
        return NextResponse.json({ 
          error: 'Rate limit exceeded. Please try again in a minute.',
          debug: { rate_limited: true }
        }, { status: 429 })
      }

      const testResponse = await makeNeynarRequest(`https://api.neynar.com/v2/farcaster/user?fid=${userFid}`)

      if (!testResponse.ok) {
        const errorText = await testResponse.text()
        console.error(`❌ Neynar API error: ${testResponse.status} ${testResponse.statusText}`, errorText)
        
        // Handle specific Neynar error codes
        if (testResponse.status === 429) {
          return NextResponse.json({ 
            error: 'Rate limit exceeded. Please try again later.',
            debug: { status: testResponse.status, rate_limited: true }
          }, { status: 429 })
        }
        
        if (testResponse.status === 404) {
          return NextResponse.json({ 
            error: 'User not found. Please check the FID.',
            debug: { status: testResponse.status, fid: userFid }
          }, { status: 404 })
        }

        return NextResponse.json({ 
          error: `Neynar API error: ${testResponse.status}`,
          debug: {
            status: testResponse.status,
            statusText: testResponse.statusText,
            error_details: errorText
          }
        }, { status: testResponse.status })
      }

      const testData = await testResponse.json()
      console.log('✅ Neynar API test successful')

      // Get best friends with improved error handling
      if (!checkRateLimit('best-friends')) {
        return NextResponse.json({ 
          error: 'Rate limit exceeded. Please try again in a minute.',
          debug: { rate_limited: true }
        }, { status: 429 })
      }

      const bestFriendsResponse = await makeNeynarRequest(
        `https://api.neynar.com/v2/farcaster/user/best_friends?fid=${userFid}&limit=8`
      )

      if (!bestFriendsResponse.ok) {
        const errorText = await bestFriendsResponse.text()
        console.error(`❌ Best friends API error: ${bestFriendsResponse.status}`, errorText)
        
        if (bestFriendsResponse.status === 429) {
          return NextResponse.json({ 
            error: 'Rate limit exceeded. Please try again later.',
            debug: { status: bestFriendsResponse.status, rate_limited: true }
          }, { status: 429 })
        }

        return NextResponse.json({ 
          error: `Best friends API error: ${bestFriendsResponse.status}`,
          debug: {
            status: bestFriendsResponse.status,
            statusText: bestFriendsResponse.statusText,
            error_details: errorText
          }
        }, { status: bestFriendsResponse.status })
      }

      const bestFriendsData = await bestFriendsResponse.json()
      const bestFriends = bestFriendsData.users || []
      
      console.log(`✅ Found ${bestFriends.length} best friends`)

      if (bestFriends.length === 0) {
        return NextResponse.json({ 
          top8: [],
          stats: {
            total_users: 0,
            average_affinity_score: 0,
            top_affinity_score: 0
          },
          message: "No best friends found yet. Start interacting with people to build your Top 8!"
        })
      }

      // Build simplified Top 8 with enhanced data
      const top8 = bestFriends.slice(0, 8).map((friend: any, index: number) => ({
        fid: friend.fid,
        username: friend.username || `user${friend.fid}`,
        display_name: friend.display_name || '',
        pfp_url: friend.pfp_url || '',
        bio: friend.bio || '',
        ens_name: friend.ens_name || '',
        mutual_affinity_score: friend.mutual_affinity_score || 0,
        rank: index + 1,
        // Enhanced metadata
        verified: friend.verified || false,
        follower_count: friend.follower_count || 0,
        following_count: friend.following_count || 0
      }))

      const totalAffinityScore = top8.reduce((sum: number, user: any) => sum + user.mutual_affinity_score, 0)
      const topAffinityScore = Math.max(...top8.map((user: any) => user.mutual_affinity_score))

      const stats = {
        total_users: top8.length,
        average_affinity_score: top8.length > 0 ? totalAffinityScore / top8.length : 0,
        top_affinity_score: topAffinityScore,
        // Additional stats
        total_followers: top8.reduce((sum: number, user: any) => sum + user.follower_count, 0),
        total_following: top8.reduce((sum: number, user: any) => sum + user.following_count, 0),
        verified_users: top8.filter((user: any) => user.verified).length
      }

      console.log(`✅ Top 8 fetched successfully for FID ${fid}:`, top8.length, 'users')

      return NextResponse.json({
        top8,
        stats,
        debug: {
          api_key_configured: !!NEYNAR_API_KEY,
          best_friends_found: bestFriends.length,
          top8_built: top8.length,
          rate_limits_checked: true
        }
      })

    } catch (apiError) {
      console.error('❌ API call failed:', apiError)
      
      // Handle specific error types
      if (apiError instanceof Error) {
        if (apiError.name === 'AbortError') {
          return NextResponse.json({ 
            error: 'Request timeout. Please try again.',
            debug: {
              error_type: 'timeout',
              error_message: apiError.message
            }
          }, { status: 408 })
        }
        
        if (apiError.message.includes('fetch')) {
          return NextResponse.json({ 
            error: 'Network error. Please check your connection.',
            debug: {
              error_type: 'network',
              error_message: apiError.message
            }
          }, { status: 503 })
        }
      }
      
      return NextResponse.json({ 
        error: 'Failed to fetch data from Neynar API',
        debug: {
          error_message: apiError instanceof Error ? apiError.message : 'Unknown error',
          api_key_configured: !!NEYNAR_API_KEY
        }
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Error in Top 8 Simple API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch Top 8 data',
        debug: {
          error_message: error instanceof Error ? error.message : 'Unknown error',
          api_key_configured: !!NEYNAR_API_KEY
        }
      },
      { status: 500 }
    )
  }
} 
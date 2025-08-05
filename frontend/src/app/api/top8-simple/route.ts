import { NextRequest, NextResponse } from 'next/server'

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY

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

    // Test basic Neynar API call
    try {
      const testResponse = await fetch(`https://api.neynar.com/v2/farcaster/user?fid=${userFid}`, {
        headers: { 
          'x-api-key': NEYNAR_API_KEY, 
          'accept': 'application/json'
        },
        signal: AbortSignal.timeout(5000)
      })

      if (!testResponse.ok) {
        console.error(`❌ Neynar API error: ${testResponse.status} ${testResponse.statusText}`)
        return NextResponse.json({ 
          error: `Neynar API error: ${testResponse.status}`,
          debug: {
            status: testResponse.status,
            statusText: testResponse.statusText
          }
        }, { status: testResponse.status })
      }

      const testData = await testResponse.json()
      console.log('✅ Neynar API test successful')

      // Get best friends
      const bestFriendsResponse = await fetch(`https://api.neynar.com/v2/farcaster/user/best_friends?fid=${userFid}&limit=8`, {
        headers: { 
          'x-api-key': NEYNAR_API_KEY, 
          'accept': 'application/json' 
        },
        signal: AbortSignal.timeout(5000)
      })

      if (!bestFriendsResponse.ok) {
        console.error(`❌ Best friends API error: ${bestFriendsResponse.status}`)
        return NextResponse.json({ 
          error: `Best friends API error: ${bestFriendsResponse.status}`,
          debug: {
            status: bestFriendsResponse.status,
            statusText: bestFriendsResponse.statusText
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

      // Build simplified Top 8
      const top8 = bestFriends.slice(0, 8).map((friend: any, index: number) => ({
        fid: friend.fid,
        username: friend.username || `user${friend.fid}`,
        display_name: friend.display_name || '',
        pfp_url: friend.pfp_url || '',
        bio: friend.bio || '',
        ens_name: friend.ens_name || '',
        mutual_affinity_score: friend.mutual_affinity_score || 0,
        rank: index + 1
      }))

      const totalAffinityScore = top8.reduce((sum: number, user: any) => sum + user.mutual_affinity_score, 0)
      const topAffinityScore = Math.max(...top8.map((user: any) => user.mutual_affinity_score))

      const stats = {
        total_users: top8.length,
        average_affinity_score: top8.length > 0 ? totalAffinityScore / top8.length : 0,
        top_affinity_score: topAffinityScore
      }

      console.log(`✅ Top 8 fetched successfully for FID ${fid}:`, top8.length, 'users')

      return NextResponse.json({
        top8,
        stats,
        debug: {
          api_key_configured: !!NEYNAR_API_KEY,
          best_friends_found: bestFriends.length,
          top8_built: top8.length
        }
      })

    } catch (apiError) {
      console.error('❌ API call failed:', apiError)
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
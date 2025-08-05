import { NextRequest, NextResponse } from "next/server"

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || "1E58A226-A64C-4CF3-A047-FBED94F36101"

interface LeaderboardEntry {
  fid: number
  username: string
  display_name: string
  pfp_url: string
  bio: string
  ens_name?: string
  reply_count: number
  quality_score: number
  social_influence_score: number
  is_friend: boolean
  is_mutual: boolean
  rank: number
}

// Simple rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 30 // requests per minute
const RATE_WINDOW = 60000 // 1 minute

function checkRateLimit(endpoint: string): boolean {
  const now = Date.now()
  const key = `${endpoint}:${Math.floor(now / RATE_WINDOW)}`
  const current = requestCounts.get(key) || { count: 0, resetTime: now + RATE_WINDOW }
  
  if (now > current.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + RATE_WINDOW })
    return true
  }
  
  if (current.count >= RATE_LIMIT) {
    return false
  }
  
  current.count++
  requestCounts.set(key, current)
  return true
}

// Fetch user's following list
async function fetchUserFollowing(fid: number): Promise<number[]> {
  if (!checkRateLimit('user-following')) {
    console.warn('Rate limit exceeded for user following')
    return []
  }

  try {
    const response = await fetch(`https://api.neynar.com/v2/farcaster/follows?follower=${fid}&limit=100`, {
      headers: { 
        'x-api-key': NEYNAR_API_KEY, 
        'accept': 'application/json' 
      },
      signal: AbortSignal.timeout(8000)
    })
    
    if (!response.ok) {
      console.error(`Failed to fetch following for FID ${fid}: ${response.status}`)
      return []
    }
    
    const data = await response.json()
    return data.follows?.map((follow: any) => follow.following) || []
  } catch (error) {
    console.error(`Error fetching following for FID ${fid}:`, error)
    return []
  }
}

// Fetch user's followers list
async function fetchUserFollowers(fid: number): Promise<number[]> {
  if (!checkRateLimit('user-followers')) {
    console.warn('Rate limit exceeded for user followers')
    return []
  }

  try {
    const response = await fetch(`https://api.neynar.com/v2/farcaster/follows?following=${fid}&limit=100`, {
      headers: { 
        'x-api-key': NEYNAR_API_KEY, 
        'accept': 'application/json' 
      },
      signal: AbortSignal.timeout(8000)
    })
    
    if (!response.ok) {
      console.error(`Failed to fetch followers for FID ${fid}: ${response.status}`)
      return []
    }
    
    const data = await response.json()
    return data.follows?.map((follow: any) => follow.follower) || []
  } catch (error) {
    console.error(`Error fetching followers for FID ${fid}:`, error)
    return []
  }
}

// Fetch user data with caching
const userDataCache = new Map<number, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function fetchUserData(fid: number): Promise<any> {
  const cached = userDataCache.get(fid)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  if (!checkRateLimit('user-data')) {
    console.warn('Rate limit exceeded for user data')
    return {}
  }

  try {
    const response = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`, {
      headers: { 
        'x-api-key': NEYNAR_API_KEY, 
        'accept': 'application/json',
        'x-neynar-experimental': 'true'
      },
      signal: AbortSignal.timeout(8000)
    })
    
    if (!response.ok) {
      console.error(`Failed to fetch user data for FID ${fid}: ${response.status}`)
      return {}
    }
    
    const data = await response.json()
    const user = data.users?.[0]
    
    if (user) {
      userDataCache.set(fid, { data: user, timestamp: Date.now() })
      return user
    }
    
    return {}
  } catch (error) {
    console.error(`Error fetching user data for FID ${fid}:`, error)
    return {}
  }
}

// Calculate social influence score
function calculateSocialInfluenceScore(user: any): number {
  let score = 0
  
  if (user.follower_count) {
    score += Math.log10(user.follower_count + 1) * 10
  }
  
  if (user.verified_addresses?.eth_addresses?.length > 0) {
    score += 20
  }
  
  if (user.power_badge) {
    score += 30
  }
  
  if (user.active_status === 'active') {
    score += 15
  }
  
  if (user.experimental?.neynar_user_score) {
    score += user.experimental.neynar_user_score * 50
  }
  
  return Math.min(score, 100)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fid = searchParams.get('fid')
    const type = searchParams.get('type') || 'friends' // 'friends', 'global', 'mutual'

    if (!fid) {
      return NextResponse.json({ error: "FID is required" }, { status: 400 })
    }

    console.log(`Fetching ${type} leaderboard for FID: ${fid}`)

    // Get user's social connections
    const userFid = parseInt(fid)
    const following = await fetchUserFollowing(userFid)
    const followers = await fetchUserFollowers(userFid)
    
    // Find mutual connections
    const mutualConnections = following.filter(fid => followers.includes(fid))
    
    console.log(`Found ${following.length} following, ${followers.length} followers, ${mutualConnections.length} mutual`)

    // Get reply guys data for the user
    const replyGuysResponse = await fetch(`${request.nextUrl.origin}/api/replyguys?fid=${userFid}`)
    const replyGuysData = await replyGuysResponse.json()
    
    if (!replyGuysData.replyGuys) {
      return NextResponse.json({ 
        leaderboard: [],
        message: "No reply guys found. Start posting to build your leaderboard!"
      })
    }

    // Create a map of reply guys for quick lookup
    const replyGuysMap = new Map<number, any>()
    replyGuysData.replyGuys.forEach((rg: any) => {
      replyGuysMap.set(rg.fid, rg)
    })

    // Build leaderboard based on type
    let leaderboardFids: number[] = []
    
    switch (type) {
      case 'friends':
        // Show reply guys who are in your following list
        leaderboardFids = following.filter(fid => replyGuysMap.has(fid))
        break
      case 'mutual':
        // Show reply guys who are mutual connections
        leaderboardFids = mutualConnections.filter(fid => replyGuysMap.has(fid))
        break
      case 'global':
        // Show all reply guys (already have them)
        leaderboardFids = replyGuysData.replyGuys.map((rg: any) => rg.fid)
        break
      default:
        leaderboardFids = following.filter(fid => replyGuysMap.has(fid))
    }

    // Build leaderboard entries
    const leaderboard: LeaderboardEntry[] = []
    
    for (let i = 0; i < leaderboardFids.length; i++) {
      const replyGuy = replyGuysMap.get(leaderboardFids[i])
      if (!replyGuy) continue
      
      const isFriend = following.includes(replyGuy.fid)
      const isMutual = mutualConnections.includes(replyGuy.fid)
      
      leaderboard.push({
        fid: replyGuy.fid,
        username: replyGuy.username,
        display_name: replyGuy.display_name,
        pfp_url: replyGuy.pfp_url,
        bio: replyGuy.bio,
        ens_name: replyGuy.ens_name,
        reply_count: replyGuy.replyCount,
        quality_score: replyGuy.reply_quality_score || 0,
        social_influence_score: replyGuy.social_influence_score || 0,
        is_friend: isFriend,
        is_mutual: isMutual,
        rank: i + 1
      })
    }

    // Sort by quality score
    leaderboard.sort((a, b) => b.quality_score - a.quality_score)
    
    // Update ranks after sorting
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1
    })

    console.log(`Built ${type} leaderboard with ${leaderboard.length} entries`)

    return NextResponse.json({
      leaderboard,
      type,
      message: `Top ${type} reply guys leaderboard`,
      stats: {
        total_entries: leaderboard.length,
        friends_count: leaderboard.filter(e => e.is_friend).length,
        mutual_count: leaderboard.filter(e => e.is_mutual).length,
        average_quality_score: leaderboard.reduce((sum, e) => sum + e.quality_score, 0) / leaderboard.length
      }
    })

  } catch (error) {
    console.error('Error in leaderboard API:', error)
    return NextResponse.json({ 
      error: "Failed to fetch leaderboard. Please try again." 
    }, { status: 500 })
  }
} 
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('User API route called')
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    console.log('Auth header present:', !!authHeader)
    
    // For now, let's make auth optional for testing
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid auth header, proceeding without authentication')
      // Continue without auth for now
    }

    const { searchParams } = new URL(request.url)
    const fid = searchParams.get('fid')

    if (!fid) {
      return NextResponse.json(
        { error: 'Missing FID parameter' },
        { status: 400 }
      )
    }

    console.log(`Processing request for FID: ${fid}`)

    // Get Neynar API key from environment
    const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY

    if (!NEYNAR_API_KEY) {
      console.log('No Neynar API key found, returning test data')
      return NextResponse.json({
        fid: fid,
        username: `user_${fid}`,
        displayName: `User ${fid}`,
        message: 'No Neynar API key configured - using test data',
        test: true,
        topInteractions: []
      })
    }

    // Fetch user info from Neynar
    const userResponse = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`, {
      headers: {
        'accept': 'application/json',
        'api_key': NEYNAR_API_KEY
      }
    })

    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error(`Neynar user API failed: ${userResponse.status} - ${userResponse.statusText}`)
      console.error('Error response:', errorText)
      return NextResponse.json(
        { error: `Neynar user API failed: ${userResponse.status}`, details: errorText },
        { status: userResponse.status }
      )
    }

    const userData = await userResponse.json()
    const user = userData.users?.[0]

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in Neynar response' },
        { status: 404 }
      )
    }

    console.log(`Processing user: ${user.username} (FID: ${user.fid})`)

    // For now, return basic user data without complex indexing
    return NextResponse.json({
      fid: user.fid,
      username: user.username,
      displayName: user.display_name,
      avatar: user.pfp_url,
      bio: user.profile?.bio?.text || '',
      followerCount: user.follower_count,
      followingCount: user.following_count,
      castCount: user.cast_count,
      verified: user.verified_addresses?.length > 0,
      message: 'Basic user data loaded successfully',
      test: false,
      topInteractions: [] // We'll add this back once basic data works
    })

  } catch (error) {
    console.error('Error in user API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
} 
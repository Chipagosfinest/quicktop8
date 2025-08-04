import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fid: string }> }
) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const { fid } = await params

    console.log(`Processing request for FID: ${fid}`)
    console.log(`Token present: ${!!token}`)

    // TODO: Validate the Quick Auth token using @farcaster/quick-auth
    // For now, we'll return mock data
    const userData = {
      fid: parseInt(fid),
      username: `user_${fid}`,
      displayName: `User ${fid}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fid}`,
      followers: Math.floor(Math.random() * 1000) + 100,
      following: Math.floor(Math.random() * 500) + 50,
      casts: Math.floor(Math.random() * 5000) + 1000,
      joinedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      topInteractions: [
        { fid: 1234, username: 'friend1', interactionCount: 45 },
        { fid: 5678, username: 'friend2', interactionCount: 32 },
        { fid: 9012, username: 'friend3', interactionCount: 28 },
        { fid: 3456, username: 'friend4', interactionCount: 25 },
        { fid: 7890, username: 'friend5', interactionCount: 22 },
        { fid: 2345, username: 'friend6', interactionCount: 19 },
        { fid: 6789, username: 'friend7', interactionCount: 16 },
        { fid: 123, username: 'friend8', interactionCount: 14 }
      ]
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error('Error processing user request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
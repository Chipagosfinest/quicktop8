import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fid: string }> }
) {
  try {
    console.log('Dynamic route called')
    
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

    // Simple response for now
    const userData = {
      fid: parseInt(fid),
      username: `user_${fid}`,
      displayName: `User ${fid}`,
      message: 'Dynamic route working!',
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error('Error processing user request:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 
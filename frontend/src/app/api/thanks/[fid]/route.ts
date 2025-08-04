import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fid: string }> }
) {
  try {
    const { fid } = await params
    
    // Simple test response
    return NextResponse.json({
      message: 'Thanks API working!',
      fid: fid,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in thanks API:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
} 
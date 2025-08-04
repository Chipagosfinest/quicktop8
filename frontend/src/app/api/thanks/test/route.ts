import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      message: 'Thanks API is working!',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in thanks test API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
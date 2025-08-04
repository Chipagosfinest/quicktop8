import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    console.log('Test API endpoint called successfully')
    console.log(`Token present: ${!!authHeader.split(' ')[1]}`)

    const testData = {
      message: 'API is working!',
      timestamp: new Date().toISOString(),
      test: true
    }

    return NextResponse.json(testData)
  } catch (error) {
    console.error('Error in test API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
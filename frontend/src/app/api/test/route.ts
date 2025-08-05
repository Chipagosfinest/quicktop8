import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Test basic functionality
    const testData = {
      message: "API is working!",
      timestamp: new Date().toISOString(),
      environment: {
        neynar_api_key: process.env.NEYNAR_API_KEY ? "Configured" : "Missing",
        node_env: process.env.NODE_ENV,
        vercel_env: process.env.VERCEL_ENV
      }
    }

    return NextResponse.json(testData)
  } catch (error) {
    console.error('Error in test API:', error)
    return NextResponse.json(
      { error: 'Test API failed' },
      { status: 500 }
    )
  }
} 
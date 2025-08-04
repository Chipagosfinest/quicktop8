import { NextRequest, NextResponse } from "next/server"

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || "1E58A226-A64C-4CF3-A047-FBED94F36101"

export async function GET() {
  try {
    console.log('Testing API connectivity...')
    console.log(`API Key available: ${NEYNAR_API_KEY ? 'Yes' : 'No'}`)
    console.log(`API Key length: ${NEYNAR_API_KEY?.length || 0}`)

    // Test the API with a known working FID
    const testResponse = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=194`, {
      headers: {
        'x-api-key': NEYNAR_API_KEY,
        'accept': 'application/json'
      }
    })

    if (testResponse.ok) {
      const testData = await testResponse.json()
      return NextResponse.json({
        success: true,
        message: "API connectivity test passed",
        apiKeyAvailable: !!NEYNAR_API_KEY,
        apiKeyLength: NEYNAR_API_KEY?.length || 0,
        testResult: {
          status: testResponse.status,
          usersFound: testData.users?.length || 0
        }
      })
    } else {
      const errorText = await testResponse.text()
      return NextResponse.json({
        success: false,
        message: "API connectivity test failed",
        apiKeyAvailable: !!NEYNAR_API_KEY,
        apiKeyLength: NEYNAR_API_KEY?.length || 0,
        error: {
          status: testResponse.status,
          statusText: testResponse.statusText,
          details: errorText
        }
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json({
      success: false,
      message: "API connectivity test failed",
      apiKeyAvailable: !!NEYNAR_API_KEY,
      apiKeyLength: NEYNAR_API_KEY?.length || 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 
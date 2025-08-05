import { NextResponse } from 'next/server'

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY

export async function GET() {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        neynar_api: 'unknown',
        database: 'unknown',
        cache: 'unknown'
      },
      config: {
        neynar_api_key_configured: !!NEYNAR_API_KEY,
        app_url: process.env.NEXT_PUBLIC_APP_URL || 'not configured'
      }
    }

    // Test Neynar API connectivity
    if (NEYNAR_API_KEY) {
      try {
        const testResponse = await fetch('https://api.neynar.com/v2/farcaster/user/bulk/?fids=2', {
          headers: { 
            'x-api-key': NEYNAR_API_KEY, 
            'accept': 'application/json'
          },
          signal: AbortSignal.timeout(5000)
        })

        if (testResponse.ok) {
          health.services.neynar_api = 'healthy'
        } else {
          health.services.neynar_api = `error: ${testResponse.status}`
        }
      } catch (error) {
        health.services.neynar_api = `error: ${error instanceof Error ? error.message : 'unknown'}`
      }
    } else {
      health.services.neynar_api = 'not configured'
    }

    // Determine overall health
    const allServicesHealthy = Object.values(health.services).every(
      service => service === 'healthy'
    )

    if (!allServicesHealthy) {
      health.status = 'degraded'
    }

    return NextResponse.json(health, { 
      status: allServicesHealthy ? 200 : 503 
    })

  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 
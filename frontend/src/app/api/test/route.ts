import { NextRequest, NextResponse } from 'next/server'

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY

interface TestResult {
  status?: number | string
  ok?: boolean
  statusText?: string
  error?: string
  data?: any
  tests?: any[]
  summary?: any
  [key: string]: any // Allow dynamic properties
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const testType = searchParams.get('type') || 'basic'
    const fid = searchParams.get('fid') || '2' // Default to FID 2 (Dwr)

    const results = {
      timestamp: new Date().toISOString(),
      test_type: testType,
      neynar_api_key_configured: !!NEYNAR_API_KEY,
      tests: {} as Record<string, TestResult>
    }

    if (!NEYNAR_API_KEY) {
      return NextResponse.json({
        error: 'NEYNAR_API_KEY not configured',
        ...results
      }, { status: 500 })
    }

    // Test 1: Basic user info
    try {
      console.log('🧪 Testing basic user info...')
      const userResponse = await fetch(`https://api.neynar.com/v2/farcaster/user?fid=${fid}`, {
        headers: { 
          'x-api-key': NEYNAR_API_KEY, 
          'accept': 'application/json'
        },
        signal: AbortSignal.timeout(5000)
      })

      results.tests.user_info = {
        status: userResponse.status,
        ok: userResponse.ok,
        statusText: userResponse.statusText
      }

      if (userResponse.ok) {
        const userData = await userResponse.json()
        results.tests.user_info.data = {
          fid: userData.user?.fid,
          username: userData.user?.username,
          display_name: userData.user?.display_name
        }
      } else {
        results.tests.user_info.error = await userResponse.text()
      }
    } catch (error) {
      results.tests.user_info = {
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'failed'
      }
    }

    // Test 2: Best friends API
    try {
      console.log('🧪 Testing best friends API...')
      const bestFriendsResponse = await fetch(`https://api.neynar.com/v2/farcaster/user/best_friends?fid=${fid}&limit=5`, {
        headers: { 
          'x-api-key': NEYNAR_API_KEY, 
          'accept': 'application/json'
        },
        signal: AbortSignal.timeout(5000)
      })

      results.tests.best_friends = {
        status: bestFriendsResponse.status,
        ok: bestFriendsResponse.ok,
        statusText: bestFriendsResponse.statusText
      }

      if (bestFriendsResponse.ok) {
        const bestFriendsData = await bestFriendsResponse.json()
        results.tests.best_friends.data = {
          count: bestFriendsData.users?.length || 0,
          users: bestFriendsData.users?.slice(0, 3).map((u: any) => ({
            fid: u.fid,
            username: u.username,
            mutual_affinity_score: u.mutual_affinity_score
          })) || []
        }
      } else {
        results.tests.best_friends.error = await bestFriendsResponse.text()
      }
    } catch (error) {
      results.tests.best_friends = {
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'failed'
      }
    }

    // Test 3: Rate limiting test
    if (testType === 'rate_limit') {
      console.log('🧪 Testing rate limits...')
      const rateLimitTests = []
      
      for (let i = 0; i < 5; i++) {
        try {
          const response = await fetch(`https://api.neynar.com/v2/farcaster/user?fid=${fid}`, {
            headers: { 
              'x-api-key': NEYNAR_API_KEY, 
              'accept': 'application/json'
            },
            signal: AbortSignal.timeout(3000)
          })
          
          rateLimitTests.push({
            request: i + 1,
            status: response.status,
            ok: response.ok
          })
          
          // Small delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 100))
        } catch (error) {
          rateLimitTests.push({
            request: i + 1,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
      
      results.tests.rate_limiting = {
        tests: rateLimitTests,
        summary: {
          successful: rateLimitTests.filter(t => t.ok).length,
          failed: rateLimitTests.filter(t => !t.ok).length,
          rate_limited: rateLimitTests.some(t => t.status === 429)
        }
      }
    }

    // Test 4: Error handling test
    if (testType === 'error_handling') {
      console.log('🧪 Testing error handling...')
      
      // Test with invalid FID
      try {
        const invalidResponse = await fetch('https://api.neynar.com/v2/farcaster/user?fid=999999999', {
          headers: { 
            'x-api-key': NEYNAR_API_KEY, 
            'accept': 'application/json'
          },
          signal: AbortSignal.timeout(5000)
        })
        
        results.tests.error_handling = {
          invalid_fid_status: invalidResponse.status,
          invalid_fid_ok: invalidResponse.ok
        }
        
        if (!invalidResponse.ok) {
          results.tests.error_handling.invalid_fid_error = await invalidResponse.text()
        }
      } catch (error) {
        results.tests.error_handling = {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    // Overall test summary
    const allTestsPassed = Object.values(results.tests).every(test => {
      if (!test) return false
      if (test.status === 'failed') return false
      if (test.ok === false) return false
      return true
    })

    return NextResponse.json({
      success: allTestsPassed,
      ...results
    }, { 
      status: allTestsPassed ? 200 : 500 
    })

  } catch (error) {
    console.error('Test endpoint failed:', error)
    return NextResponse.json({
      error: 'Test endpoint failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 
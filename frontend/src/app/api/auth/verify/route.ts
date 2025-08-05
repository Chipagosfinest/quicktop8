import { NextRequest, NextResponse } from "next/server"

function getRequestId(request: NextRequest) {
  return request.headers.get('x-request-id') || Math.random().toString(36).slice(2, 10)
}

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request)
  try {
    const { signInResult } = await request.json()

    if (!signInResult) {
      console.warn(`[auth/verify][${requestId}] No sign-in result provided`)
      return NextResponse.json({ error: "No sign-in result provided" }, { status: 400 })
    }

    console.log(`[auth/verify][${requestId}] Verifying sign-in credential`)

    // For now, we'll do basic validation
    // In a production app, you'd verify the credential with Farcaster's servers
    if (signInResult && typeof signInResult === 'object') {
      // Extract user info from the credential
      const userInfo = {
        fid: signInResult.fid || null,
        username: signInResult.username || null,
        displayName: signInResult.displayName || null,
        pfpUrl: signInResult.pfpUrl || null
      }

      // Generate a simple session token
      const token = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`

      console.log(`[auth/verify][${requestId}] Sign-in verification successful for user:`, userInfo)

      return NextResponse.json({
        success: true,
        token,
        user: userInfo
      })
    } else {
      console.warn(`[auth/verify][${requestId}] Invalid sign-in credential`)
      return NextResponse.json({ error: "Invalid sign-in credential" }, { status: 400 })
    }

  } catch (error) {
    console.error(`[auth/verify][${requestId}] Error verifying sign-in:`, error)
    return NextResponse.json({ 
      error: "Failed to verify sign-in credential" 
    }, { status: 500 })
  }
} 
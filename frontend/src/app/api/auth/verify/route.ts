import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { signInResult } = await request.json()

    if (!signInResult) {
      return NextResponse.json({ error: "No sign-in result provided" }, { status: 400 })
    }

    console.log("Verifying sign-in credential:", signInResult)

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

      console.log("Sign-in verification successful for user:", userInfo)

      return NextResponse.json({
        success: true,
        token,
        user: userInfo
      })
    } else {
      return NextResponse.json({ error: "Invalid sign-in credential" }, { status: 400 })
    }

  } catch (error) {
    console.error("Error verifying sign-in:", error)
    return NextResponse.json({ 
      error: "Failed to verify sign-in credential" 
    }, { status: 500 })
  }
} 
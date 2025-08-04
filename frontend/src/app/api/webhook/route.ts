import { NextRequest, NextResponse } from "next/server"

// Neynar webhook secret for verification
const NEYNAR_WEBHOOK_SECRET = process.env.NEYNAR_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Verify webhook signature (basic implementation)
    const signature = request.headers.get('x-neynar-signature')
    if (signature && NEYNAR_WEBHOOK_SECRET) {
      console.log("Webhook signature received:", signature)
      // TODO: Implement proper signature verification using NEYNAR_WEBHOOK_SECRET
      // For now, just log that we have the secret configured
      console.log("Webhook secret configured:", NEYNAR_WEBHOOK_SECRET ? "Yes" : "No")
    }
    
    // Handle different webhook types
    console.log("Webhook received:", body)
    
    // Handle Mini App specific webhooks
    if (body.type === "miniapp_interaction") {
      // Handle Mini App user interactions
      return NextResponse.json({
        success: true,
        message: "Mini App interaction handled"
      })
    }
    
    // Handle Farcaster activity webhooks
    if (body.type === "cast.created" || body.type === "reaction.created") {
      console.log("Farcaster activity:", body)
      return NextResponse.json({
        success: true,
        message: "Farcaster activity processed"
      })
    }
    
    // Handle general webhooks
    return NextResponse.json({
      success: true,
      message: "Webhook processed"
    })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Webhook endpoint ready"
  })
} 
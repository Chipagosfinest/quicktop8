import { NextRequest, NextResponse } from "next/server"

// Neynar webhook secret for verification
const NEYNAR_WEBHOOK_SECRET = process.env.NEYNAR_WEBHOOK_SECRET

function getRequestId(request: NextRequest) {
  return request.headers.get('x-request-id') || Math.random().toString(36).slice(2, 10)
}

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request)
  try {
    const body = await request.json()
    
    // Verify webhook signature (not implemented)
    const signature = request.headers.get('x-neynar-signature')
    if (signature && NEYNAR_WEBHOOK_SECRET) {
      console.log(`[webhook][${requestId}] Signature received:`, signature)
      // NOTE: Signature verification not implemented. See Neynar docs for details.
      console.log(`[webhook][${requestId}] Webhook secret configured:`, !!NEYNAR_WEBHOOK_SECRET)
    }
    
    // Handle different webhook types
    console.log(`[webhook][${requestId}] Webhook received:`, body)
    
    // Handle Mini App specific webhooks
    if (body.type === "miniapp_interaction") {
      console.log(`[webhook][${requestId}] Mini App interaction handled`)
      return NextResponse.json({
        success: true,
        message: "Mini App interaction handled"
      })
    }
    
    // Handle Farcaster activity webhooks
    if (body.type === "cast.created" || body.type === "reaction.created") {
      console.log(`[webhook][${requestId}] Farcaster activity:`, body)
      return NextResponse.json({
        success: true,
        message: "Farcaster activity processed"
      })
    }
    
    // Handle general webhooks
    console.log(`[webhook][${requestId}] General webhook processed`)
    return NextResponse.json({
      success: true,
      message: "Webhook processed"
    })
  } catch (error) {
    console.error(`[webhook][${requestId}] Webhook error:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Webhook endpoint ready"
  })
} 
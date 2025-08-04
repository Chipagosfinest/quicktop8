import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle frame interaction
    return NextResponse.json({
      success: true,
      message: "Frame interaction handled"
    })
  } catch (error) {
    console.error("Frame API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Frame endpoint ready"
  })
} 
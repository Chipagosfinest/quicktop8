import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { recipientFid, amount, message } = await request.json()

    if (!recipientFid || !amount) {
      return NextResponse.json({ 
        error: "Recipient FID and amount are required" 
      }, { status: 400 })
    }

    // Validate amount (in USD cents)
    const amountInCents = parseInt(amount)
    if (isNaN(amountInCents) || amountInCents < 100 || amountInCents > 10000) {
      return NextResponse.json({ 
        error: "Amount must be between $1.00 and $100.00" 
      }, { status: 400 })
    }

    // Create tip URL using Farcaster's tipping system
    const tipUrl = `https://warpcast.com/~/tip/${recipientFid}?amount=${amountInCents}&message=${encodeURIComponent(message || 'Thanks for being a ride or die! 💜')}`

    return NextResponse.json({
      success: true,
      tipUrl,
      recipientFid,
      amount: amountInCents,
      message: message || 'Thanks for being a ride or die! 💜'
    })

  } catch (error) {
    console.error('Error creating tip:', error)
    return NextResponse.json({ 
      error: "Failed to create tip. Please try again." 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Tip endpoint ready",
    supportedAmounts: [
      { value: 100, label: "$1.00" },
      { value: 500, label: "$5.00" },
      { value: 1000, label: "$10.00" },
      { value: 2500, label: "$25.00" },
      { value: 5000, label: "$50.00" },
      { value: 10000, label: "$100.00" }
    ]
  })
} 
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const { tokenId } = await params
    
    // Create metadata for prayer hand emoji NFT
    const metadata = {
      name: `Prayer Hand Emoji #${tokenId}`,
      description: "A prayer hand emoji NFT minted as appreciation for being a biggest fan on Farcaster. This NFT represents gratitude and community support.",
      image: "https://quicktop8-alpha.vercel.app/prayer-hand-emoji.svg",
      external_url: "https://quicktop8-alpha.vercel.app",
      attributes: [
        {
          trait_type: "Type",
          value: "Prayer Hand Emoji"
        },
        {
          trait_type: "Purpose",
          value: "Appreciation"
        },
        {
          trait_type: "Platform",
          value: "Farcaster"
        },
        {
          trait_type: "Rarity",
          value: "Common"
        },
        {
          trait_type: "Token ID",
          value: tokenId
        }
      ],
      properties: {
        files: [
          {
            uri: "https://quicktop8-alpha.vercel.app/prayer-hand-emoji.svg",
            type: "image/svg+xml"
          }
        ],
        category: "image",
        creators: [
          {
            address: "0x0000000000000000000000000000000000000000", // Will be set to actual creator
            share: 100
          }
        ]
      }
    }

    return NextResponse.json(metadata)
  } catch (error) {
    console.error('Error generating metadata:', error)
    return NextResponse.json(
      { error: 'Failed to generate metadata' },
      { status: 500 }
    )
  }
} 
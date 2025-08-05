import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('url')

  if (!imageUrl) {
    return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
  }

  try {
    // Validate URL
    const url = new URL(imageUrl)
    
    // Only allow specific domains for security
    const allowedDomains = [
      'warpcast.com',
      'i.imgur.com',
      'images.unsplash.com',
      'res.cloudinary.com',
      'ipfs.io',
      'ipfs.dweb.link'
    ]
    
    const isAllowed = allowedDomains.some(domain => 
      url.hostname === domain || url.hostname.endsWith(`.${domain}`)
    )
    
    if (!isAllowed) {
      return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 })
    }

    // Fetch the image
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Friends of Friends/1.0',
        'Accept': 'image/*'
      }
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: response.status })
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (error) {
    console.error('Proxy image error:', error)
    return NextResponse.json({ error: 'Failed to proxy image' }, { status: 500 })
  }
} 
import { NextRequest, NextResponse } from 'next/server'

function getRequestId(request: NextRequest) {
  return request.headers.get('x-request-id') || Math.random().toString(36).slice(2, 10)
}

async function makeBackendRequest(endpoint: string, params: Record<string, any> = {}) {
  const BACKEND_URL = process.env.NODE_ENV === 'production' 
    ? '' // Same domain
    : (process.env.BACKEND_URL || 'http://localhost:4000');
  
  const queryString = new URLSearchParams(params).toString();
  const url = `${BACKEND_URL}${endpoint}?${queryString}`;
  
  const response = await fetch(url, {
    headers: {
      'accept': 'application/json'
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Backend API error: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}

export async function GET(request: NextRequest) {
  const requestId = getRequestId(request)
  try {
    console.log(`[user/casts][${requestId}] API route called`)
    
    const { searchParams } = new URL(request.url)
    const fid = searchParams.get('fid')
    const limit = searchParams.get('limit') || '5'

    if (!fid) {
      console.warn(`[user/casts][${requestId}] Missing FID parameter`)
      return NextResponse.json(
        { error: 'Missing FID parameter' },
        { status: 400 }
      )
    }

    console.log(`[user/casts][${requestId}] Fetching casts for FID: ${fid}`)

    // Fetch casts from enhanced backend
    let castsData;
    try {
      castsData = await makeBackendRequest(`/api/user/${fid}/casts`, { limit });
    } catch (error) {
      console.error(`[user/casts][${requestId}] Backend API request failed:`, error);
      return NextResponse.json(
        { 
          error: 'Failed to fetch casts from backend',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      )
    }

    if (!castsData.success) {
      console.error(`[user/casts][${requestId}] Backend returned unsuccessful response`)
      return NextResponse.json(
        { error: 'Failed to fetch casts data' },
        { status: 500 }
      )
    }

    const casts = castsData.data?.casts || [];
    console.log(`[user/casts][${requestId}] Returning ${casts.length} casts`)

    return NextResponse.json({
      success: true,
      data: {
        fid: parseInt(fid),
        casts: casts,
        count: casts.length
      }
    });

  } catch (error) {
    console.error(`[user/casts][${requestId}] Error in user casts API:`, error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 
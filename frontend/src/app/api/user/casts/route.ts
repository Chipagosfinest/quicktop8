import { NextRequest, NextResponse } from 'next/server'

async function makeBackendRequest(endpoint: string, params: Record<string, any> = {}) {
  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
  
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
  try {
    console.log('User casts API route called')
    
    const { searchParams } = new URL(request.url)
    const fid = searchParams.get('fid')
    const limit = searchParams.get('limit') || '5'

    if (!fid) {
      return NextResponse.json(
        { error: 'Missing FID parameter' },
        { status: 400 }
      )
    }

    console.log(`Fetching casts for FID: ${fid}`)

    // Fetch casts from enhanced backend
    let castsData;
    try {
      castsData = await makeBackendRequest(`/api/user/${fid}/casts`, { limit });
    } catch (error) {
      console.error('Backend API request failed:', error);
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch casts from backend',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      )
    }

    if (!castsData.success) {
      return NextResponse.json(
        { error: 'Failed to fetch casts data' },
        { status: 500 }
      )
    }

    const casts = castsData.data?.casts || [];

    return NextResponse.json({
      success: true,
      data: {
        fid: parseInt(fid),
        casts: casts,
        count: casts.length
      }
    });

  } catch (error) {
    console.error('Error in user casts API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 
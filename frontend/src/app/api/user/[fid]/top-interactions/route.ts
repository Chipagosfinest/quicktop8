import { NextRequest, NextResponse } from 'next/server'

// Proxy to backend API - use production URL for deployed app
const BACKEND_URL = process.env.BACKEND_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://quicktop8-alpha.vercel.app' 
    : 'http://localhost:4000');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fid: string }> }
) {
  try {
    const { fid } = await params;
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '8';
    const filterSpam = searchParams.get('filter_spam') || 'true';
    
    console.log(`Top interactions API route called for FID: ${fid}`)

    if (!fid) {
      return NextResponse.json(
        { error: 'Missing FID parameter' },
        { status: 400 }
      )
    }

    console.log(`Proxying top interactions request for FID: ${fid} to backend`)

    // Proxy the request to the backend
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/user/${fid}/top-interactions?limit=${limit}&filter_spam=${filterSpam}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json(
        errorData,
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in top interactions API proxy:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
} 
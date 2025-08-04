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
    console.log(`User API route called for FID: ${fid}`)

    if (!fid) {
      return NextResponse.json(
        { error: 'Missing FID parameter' },
        { status: 400 }
      )
    }

    console.log(`Proxying request for FID: ${fid} to backend`)

    // Proxy the request to the backend
    const backendResponse = await fetch(`${BACKEND_URL}/api/user/${fid}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

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
    console.error('Error in user API proxy:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
} 
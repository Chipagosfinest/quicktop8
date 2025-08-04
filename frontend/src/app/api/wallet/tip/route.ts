import { NextRequest, NextResponse } from 'next/server'

// Proxy to backend API - use production URL for deployed app
const BACKEND_URL = process.env.BACKEND_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://quicktop8-alpha.vercel.app'
    : 'http://localhost:4000');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Wallet tip API route called with:', body);

    // Proxy the request to the backend
    const backendResponse = await fetch(`${BACKEND_URL}/api/wallet/tip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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
    console.error('Error in wallet tip API proxy:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
} 